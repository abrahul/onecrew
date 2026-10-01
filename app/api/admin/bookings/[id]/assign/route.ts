import { NextRequest, NextResponse } from 'next/server';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let body: { workerId?: unknown }; try { body = await request.json(); } catch { return badRequest('Invalid request body.'); }
  const workerId = typeof body.workerId === 'string' ? body.workerId : '';
  if (!workerId) return badRequest('Select a worker.');
  try {
    const booking = await db.$transaction(async tx => {
      const current = await tx.booking.findUnique({ where: { id: context.params.id } });
      if (!current) throw new Error('BOOKING_NOT_FOUND');
      if (current.paymentStatus !== 'PAID' || ['CANCELLED', 'WORK_COMPLETED'].includes(current.status)) throw new Error('BOOKING_NOT_ASSIGNABLE');
      const worker = await tx.worker.findUnique({ where: { id: workerId } });
      if (!worker || worker.status !== 'AVAILABLE') throw new Error('WORKER_UNAVAILABLE');
      const reserved = await tx.worker.updateMany({ where: { id: workerId, status: 'AVAILABLE' }, data: { status: 'BUSY' } });
      if (reserved.count !== 1) throw new Error('WORKER_UNAVAILABLE');
      if (current.assignedWorkerId && current.assignedWorkerId !== workerId) await tx.worker.updateMany({ where: { id: current.assignedWorkerId, status: 'BUSY' }, data: { status: 'AVAILABLE' } });
      const updated = await tx.booking.update({ where: { id: current.id }, data: { assignedWorkerId: worker.id, assignedById: admin.id, assignedAt: new Date(), status: 'ASSIGNED' }, include: { customer: true, service: true, assignedWorker: true } });
      if (current.status !== 'ASSIGNED') await tx.bookingStatusHistory.create({ data: { bookingId: current.id, previousStatus: current.status, newStatus: 'ASSIGNED', changedById: admin.id } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: 'ASSIGN_WORKER', entity: 'Booking', entityId: current.id, details: { workerId } } });
      return updated;
    }, { isolationLevel: 'Serializable' });
    return NextResponse.json(booking);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'BOOKING_NOT_FOUND') return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (message === 'WORKER_UNAVAILABLE') return NextResponse.json({ error: 'That worker is no longer available.' }, { status: 409 });
    if (message === 'BOOKING_NOT_ASSIGNABLE') return badRequest('This booking cannot be assigned in its current state.');
    throw error;
  }
}
