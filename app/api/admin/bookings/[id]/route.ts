import { NextRequest, NextResponse } from 'next/server';
import { BookingStatus } from '@prisma/client';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
const valid = Object.values(BookingStatus);
export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  if (!await authenticatedAdmin()) return unauthorized();
  const booking = await db.booking.findUnique({ where: { id: context.params.id }, include: { customer: true, service: true, assignedWorker: true, statusHistory: { orderBy: { timestamp: 'asc' }, include: { changedBy: { select: { name: true } } } }, paymentVerifiedBy: { select: { name: true } }, createdBy: { select: { name: true } } } });
  return booking ? NextResponse.json(booking) : NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
}
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin();
  if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let body: { status?: string; paymentStatus?: string; paymentReference?: string; paymentNotes?: string };
  try { body = await request.json(); } catch { return badRequest('Invalid request body.'); }
  const current = await db.booking.findUnique({ where: { id: context.params.id } });
  if (!current) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  if (body.status && !valid.includes(body.status as BookingStatus)) return badRequest('Select a valid status.');
  if (body.status && body.status !== 'CANCELLED' && current.paymentStatus !== 'PAID') return badRequest('Only paid bookings can be active or confirmed.');
  if (body.status && body.status !== current.status) {
    const allowed: Record<BookingStatus, BookingStatus[]> = {
      CONFIRMED: ['ASSIGNED', 'CANCELLED'], ASSIGNED: ['WORKER_ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED', 'CANCELLED'],
      WORKER_ON_THE_WAY: ['WORK_STARTED', 'WORK_COMPLETED', 'CANCELLED'], WORK_STARTED: ['WORK_COMPLETED', 'CANCELLED'],
      WORK_COMPLETED: [], CANCELLED: [],
    };
    if (!allowed[current.status].includes(body.status as BookingStatus)) return badRequest('That status change is not valid from the current booking state.');
  }
  if (body.paymentStatus && !['PAID', 'PENDING', 'REFUNDED'].includes(body.paymentStatus)) return badRequest('Select a valid payment status.');
  if (body.status === 'ASSIGNED' && !current.assignedWorkerId) return badRequest('Assign a worker before changing the booking status to ASSIGNED.');
  if (['WORKER_ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED'].includes(body.status || '') && !current.assignedWorkerId) return badRequest('Assign a worker before advancing this job.');
  if (body.paymentStatus && body.paymentStatus !== 'PAID' && current.status !== 'CANCELLED') return badRequest('An active booking must have paid status. Cancel the booking before changing its payment state.');
  const updated = await db.$transaction(async tx => {
    const booking = await tx.booking.update({ where: { id: current.id }, data: {
      ...(body.status ? { status: body.status as BookingStatus } : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus as 'PAID' | 'PENDING' | 'REFUNDED', paymentVerifiedById: body.paymentStatus === 'PAID' ? admin.id : null, paymentVerifiedAt: body.paymentStatus === 'PAID' ? new Date() : null } : {}),
      ...(body.paymentReference !== undefined ? { paymentReference: body.paymentReference.slice(0, 160) || null } : {}),
      ...(body.paymentNotes !== undefined ? { paymentNotes: body.paymentNotes.slice(0, 1000) || null } : {}),
    }, include: { customer: true, service: true, assignedWorker: true } });
    if (body.status && body.status !== current.status) await tx.bookingStatusHistory.create({ data: { bookingId: current.id, previousStatus: current.status, newStatus: body.status as BookingStatus, changedById: admin.id } });
    if (body.status && ['WORK_COMPLETED', 'CANCELLED'].includes(body.status) && current.assignedWorkerId) await tx.worker.updateMany({ where: { id: current.assignedWorkerId, status: 'BUSY' }, data: { status: 'AVAILABLE' } });
    await tx.auditLog.create({ data: { adminId: admin.id, action: 'UPDATE_BOOKING', entity: 'Booking', entityId: current.id, details: JSON.parse(JSON.stringify({ status: body.status, paymentStatus: body.paymentStatus })) } });
    return booking;
  });
  return NextResponse.json(updated);
}
