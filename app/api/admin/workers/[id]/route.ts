import { NextRequest, NextResponse } from 'next/server';
import { Prisma, WorkerStatus, WorkerType } from '@prisma/client';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let b: Record<string, unknown>; try { b = await request.json(); } catch { return badRequest('Invalid request body.'); }
  const current = await db.worker.findUnique({ where: { id: context.params.id } }); if (!current) return NextResponse.json({ error: 'Worker not found.' }, { status: 404 });
  const data: Prisma.WorkerUpdateInput = {};
  if (typeof b.status === 'string') { if (!Object.values(WorkerStatus).includes(b.status as WorkerStatus)) return badRequest('Select a valid worker status.'); data.status = b.status as WorkerStatus; }
  if (b.status === 'AVAILABLE' || b.status === 'OFFLINE' || b.status === 'INACTIVE') {
    const activeAssignment = await db.booking.findFirst({ where: { assignedWorkerId: current.id, status: { in: ['ASSIGNED', 'WORKER_ON_THE_WAY', 'WORK_STARTED'] } }, select: { id: true } });
    if (activeAssignment) return badRequest('This worker has an active job. Complete or cancel the booking before changing availability.');
  }
  if (typeof b.fullName === 'string') data.fullName = b.fullName.trim().slice(0, 140);
  if (typeof b.phone === 'string') data.phone = b.phone.replace(/[^+\d]/g, '').slice(0, 24);
  if (typeof b.whatsapp === 'string') data.whatsapp = b.whatsapp.replace(/[^+\d]/g, '').slice(0, 24);
  if (typeof b.workerType === 'string') { if (!Object.values(WorkerType).includes(b.workerType as WorkerType)) return badRequest('Select a valid worker type.'); data.workerType = b.workerType as WorkerType; }
  if (Array.isArray(b.skills)) data.skills = b.skills.filter((x): x is string => typeof x === 'string').map(x => x.slice(0, 80)).slice(0, 30);
  if (Array.isArray(b.serviceAreas)) data.serviceAreas = b.serviceAreas.filter((x): x is string => typeof x === 'string').map(x => x.slice(0, 80)).slice(0, 30);
  if (typeof b.availability === 'string') data.availability = b.availability.trim().slice(0, 80);
  if (b.experience !== undefined) data.experience = Number.isInteger(Number(b.experience)) && Number(b.experience) >= 0 ? Number(b.experience) : null;
  if (!Object.keys(data).length) return badRequest('No changes provided.');
  const worker = await db.worker.update({ where: { id: current.id }, data });
  await db.auditLog.create({ data: { adminId: admin.id, action: 'UPDATE_WORKER', entity: 'Worker', entityId: worker.id, details: { fields: Object.keys(data) } } });
  return NextResponse.json(worker);
}
