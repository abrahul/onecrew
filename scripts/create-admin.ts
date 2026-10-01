import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'ONECREW Admin';
  if (!email || !password || password.length < 14) throw new Error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 14 characters in the environment.');
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await db.adminUser.upsert({ where: { email }, update: { passwordHash, name, active: true }, create: { email, passwordHash, name } });
  console.log(`Admin account ready: ${admin.email} (${admin.id})`);
}
main().finally(() => db.$disconnect());
