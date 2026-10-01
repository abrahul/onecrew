import { createHash } from 'node:crypto';
import { db } from './db';

export async function consumeRateLimit(identity: string, max: number, windowSeconds: number) {
  const key = createHash('sha256').update(identity).digest('hex');
  const now = new Date();
  const reset = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${reset}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${reset} ELSE "RateLimitBucket"."resetAt" END,
      "updatedAt" = ${now}
    RETURNING "count"
  `;
  return rows[0]?.count <= max;
}
