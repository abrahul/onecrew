import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from './admin-auth';

export async function authenticatedAdmin() {
  const admin = await getAdmin();
  return admin ?? null;
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !!origin && origin === request.nextUrl.origin;
}

export function unauthorized() { return NextResponse.json({ error: 'Authentication required.' }, { status: 401 }); }
export function forbidden() { return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 }); }
export function badRequest(message: string) { return NextResponse.json({ error: message }, { status: 400 }); }

export async function writeAudit(adminId: string, action: string, entity: string, entityId?: string, details?: Record<string, unknown>) {
  const { db } = await import('./db');
  await db.auditLog.create({ data: { adminId, action, entity, entityId, ...(details ? { details: JSON.parse(JSON.stringify(details)) } : {}) } });
}
