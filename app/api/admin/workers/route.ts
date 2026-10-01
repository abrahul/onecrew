import { NextRequest, NextResponse } from 'next/server';
import { WorkerStatus, WorkerType } from '@prisma/client';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
const normalizeList = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').map(x => x.trim().slice(0, 80)).filter(Boolean).slice(0, 30) : typeof v === 'string' ? v.split(',').map(x => x.trim().slice(0, 80)).filter(Boolean).slice(0, 30) : [];
export async function GET(request: NextRequest) {
  if (!await authenticatedAdmin()) return unauthorized();
  const q = request.nextUrl.searchParams.get('q')?.trim().slice(0, 80);
  const status = request.nextUrl.searchParams.get('status');
  const workers = await db.worker.findMany({ where: { ...(status && Object.values(WorkerStatus).includes(status as WorkerStatus) ? { status: status as WorkerStatus } : {}), ...(q ? { OR: [{ fullName: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q, mode: 'insensitive' as const } }, { skills: { has: q } }] } : {}) }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { bookings: true } } } });
  return NextResponse.json(workers);
}
export async function POST(request: NextRequest) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let b: Record<string, unknown>; try { b = await request.json(); } catch { return badRequest('Invalid request body.'); }
  const fullName = typeof b.fullName === 'string' ? b.fullName.trim().slice(0, 140) : '';
  const phone = typeof b.phone === 'string' ? b.phone.replace(/[^+\d]/g, '').slice(0, 24) : '';
  const whatsapp = typeof b.whatsapp === 'string' ? b.whatsapp.replace(/[^+\d]/g, '').slice(0, 24) : '';
  const workerType = typeof b.workerType === 'string' ? b.workerType : '';
  if (!fullName || phone.length < 8 || whatsapp.length < 8 || !Object.values(WorkerType).includes(workerType as WorkerType)) return badRequest('Name, valid phone numbers and worker type are required.');
  const worker = await db.worker.create({ data: { fullName, phone, whatsapp, workerType: workerType as WorkerType, skills: normalizeList(b.skills), experience: Number.isInteger(Number(b.experience)) && Number(b.experience) >= 0 ? Number(b.experience) : null, serviceAreas: normalizeList(b.serviceAreas), availability: typeof b.availability === 'string' ? b.availability.trim().slice(0, 80) : 'On demand', status: 'AVAILABLE' } });
  await db.auditLog.create({ data: { adminId: admin.id, action: 'CREATE_WORKER', entity: 'Worker', entityId: worker.id } });
  return NextResponse.json(worker, { status: 201 });
}
