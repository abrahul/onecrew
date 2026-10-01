import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';
export async function GET(request: NextRequest) {
  if (!await authenticatedAdmin()) return unauthorized();
  const services = await db.service.findMany({ where: request.nextUrl.searchParams.get('all') === '1' ? undefined : { active: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  return NextResponse.json(services);
}
export async function PATCH(request: Request) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Request not allowed.' }, { status: 403 });
  let b: { id?: unknown; active?: unknown; category?: unknown; name?: unknown }; try { b = await request.json(); } catch { return badRequest('Invalid request.'); }
  if (typeof b.id !== 'string') return badRequest('Service id is required.');
  const data: { active?: boolean; category?: string; name?: string } = {};
  if (typeof b.active === 'boolean') data.active = b.active;
  if (typeof b.category === 'string' && b.category.trim()) data.category = b.category.trim().slice(0, 80);
  if (typeof b.name === 'string' && b.name.trim()) data.name = b.name.trim().slice(0, 120);
  const service = await db.service.update({ where: { id: b.id }, data }).catch(() => null);
  if (!service) return Response.json({ error: 'Service not found.' }, { status: 404 });
  await db.auditLog.create({ data: { adminId: admin.id, action: 'UPDATE_SERVICE', entity: 'Service', entityId: service.id, details: JSON.parse(JSON.stringify(data)) } });
  return Response.json(service);
}
