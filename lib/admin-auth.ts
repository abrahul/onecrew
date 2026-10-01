import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'onecrew_admin_session';
const SESSION_SECONDS = 60 * 60 * 8;
function hash(value: string) { return createHash('sha256').update(value).digest('hex'); }

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await db.adminSession.create({ data: { tokenHash: hash(token), adminId: userId, expiresAt } });
  return token;
}

export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const session = await db.adminSession.findFirst({ where: { tokenHash: hash(token), expiresAt: { gt: new Date() }, admin: { active: true } }, select: { admin: { select: { id: true, name: true, email: true } } } });
  return session?.admin ?? null;
}

export async function revokeSession(token?: string) {
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return;
  await db.adminSession.deleteMany({ where: { tokenHash: hash(token) } });
}

export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: SESSION_SECONDS };
}
export const sessionCookieName = COOKIE;
