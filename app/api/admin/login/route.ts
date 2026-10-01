import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession, sessionCookieName, sessionCookieOptions } from '@/lib/admin-auth';
import { sameOrigin } from '@/lib/admin-api';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const identity = forwarded || request.headers.get('x-real-ip') || 'unknown';
  if (!await consumeRateLimit(`admin-login:${identity}`, 8, 15 * 60)) return NextResponse.json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' }, { status: 429 });
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const password = typeof body.password === 'string' ? body.password.slice(0, 256) : '';
  const admin = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  const verified = admin ? await bcrypt.compare(password || 'invalid-password', admin.passwordHash) : false;
  if (!verified || !admin?.active) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  const response = NextResponse.json({ user: { id: admin.id, name: admin.name, email: admin.email } });
  response.cookies.set(sessionCookieName, await createSession(admin.id), sessionCookieOptions());
  await db.auditLog.create({ data: { adminId: admin.id, action: 'LOGIN', entity: 'AdminUser', entityId: admin.id } });
  return response;
}
