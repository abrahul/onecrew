import { NextRequest, NextResponse } from 'next/server';
import { ApplicationStatus } from '@prisma/client';
import { authenticatedAdmin, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  if (!await authenticatedAdmin()) return unauthorized();
  const status = request.nextUrl.searchParams.get('status'); const q = request.nextUrl.searchParams.get('q')?.trim().slice(0, 80);
  const applications = await db.careerApplication.findMany({ where: { ...(status && Object.values(ApplicationStatus).includes(status as ApplicationStatus) ? { status: status as ApplicationStatus } : {}), ...(q ? { OR: [{ fullName: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }, { primarySkill: { contains: q, mode: 'insensitive' } }] } : {}) }, orderBy: { createdAt: 'desc' }, take: 250, include: { files: { select: { id: true, originalName: true, mimeType: true, size: true } }, convertedWorker: { select: { id: true, fullName: true } } } });
  return NextResponse.json(applications);
}
export async function PATCH(request: NextRequest) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let b: { id?: unknown; status?: unknown }; try { b = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (typeof b.id !== 'string' || typeof b.status !== 'string' || !Object.values(ApplicationStatus).includes(b.status as ApplicationStatus)) return NextResponse.json({ error: 'Application and a valid status are required.' }, { status: 400 });
  const application = await db.careerApplication.update({ where: { id: b.id }, data: { status: b.status as ApplicationStatus }, select: { id: true, status: true, fullName: true } }).catch(() => null);
  if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  await db.auditLog.create({ data: { adminId: admin.id, action: 'UPDATE_APPLICATION', entity: 'CareerApplication', entityId: application.id, details: { status: application.status } } });
  return NextResponse.json(application);
}
