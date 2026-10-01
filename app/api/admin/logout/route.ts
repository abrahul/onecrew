import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, sessionCookieName, sessionCookieOptions } from '@/lib/admin-auth';
import { authenticatedAdmin, sameOrigin } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const admin = await authenticatedAdmin();
  try { if (admin) await db.auditLog.create({ data: { adminId: admin.id, action: 'LOGOUT', entity: 'AdminUser', entityId: admin.id } }); }
  finally { await revokeSession(request.cookies.get(sessionCookieName)?.value); }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
