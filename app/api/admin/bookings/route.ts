import { randomBytes, randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { authenticatedAdmin, badRequest, sameOrigin, unauthorized } from '@/lib/admin-api';

export const runtime = 'nodejs';
const digits = (value: unknown) => typeof value === 'string' ? value.replace(/[^+\d]/g, '').slice(0, 24) : '';
const statuses = ['CONFIRMED', 'ASSIGNED', 'WORKER_ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED', 'CANCELLED'] as const;

export async function GET(request: NextRequest) {
  if (!await authenticatedAdmin()) return unauthorized();
  const p = request.nextUrl.searchParams;
  const q = p.get('q')?.trim().slice(0, 100);
  const status = p.get('status'); const payment = p.get('payment'); const serviceId = p.get('serviceId'); const workerId = p.get('workerId'); const date = p.get('date');
  const where: Prisma.BookingWhereInput = {};
  if (status && statuses.includes(status as typeof statuses[number])) where.status = status as BookingStatus;
  if (payment && Object.values(PaymentStatus).includes(payment as PaymentStatus)) where.paymentStatus = payment as PaymentStatus;
  if (serviceId) where.serviceId = serviceId;
  if (workerId) where.assignedWorkerId = workerId;
  if (date && /^\d{4}-\d\d-\d\d$/.test(date)) where.serviceDate = new Date(`${date}T00:00:00.000Z`);
  if (q) where.OR = [
    { bookingNumber: { contains: q, mode: 'insensitive' } },
    { customer: { fullName: { contains: q, mode: 'insensitive' } } },
    { customer: { phone: { contains: digits(q) || q, mode: 'insensitive' } } },
  ];
  const bookings = await db.booking.findMany({ where, take: 250, orderBy: [{ serviceDate: 'desc' }, { serviceTime: 'asc' }], include: { customer: true, service: true, assignedWorker: { select: { id: true, fullName: true, workerType: true, status: true } } } });
  return NextResponse.json(bookings);
}

export async function POST(request: NextRequest) {
  const admin = await authenticatedAdmin();
  if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return badRequest('Invalid request body.'); }
  const name = typeof data.fullName === 'string' ? data.fullName.trim().slice(0, 140) : '';
  const phone = digits(data.phone);
  const whatsapp = digits(data.whatsapp);
  const serviceId = typeof data.serviceId === 'string' ? data.serviceId : '';
  const address = typeof data.address === 'string' ? data.address.trim().slice(0, 500) : '';
  const area = typeof data.area === 'string' ? data.area.trim().slice(0, 160) : '';
  const mapLink = typeof data.mapLink === 'string' ? data.mapLink.trim().slice(0, 1000) : '';
  const date = typeof data.date === 'string' ? data.date : '';
  const time = typeof data.time === 'string' ? data.time : '';
  const duration = typeof data.duration === 'string' ? data.duration.trim().slice(0, 100) : '';
  const workers = Number(data.numberOfWorkers);
  const requirements = typeof data.requirements === 'string' ? data.requirements.trim().slice(0, 3000) : '';
  const amount = Number(data.amount);
  const paymentReference = typeof data.paymentReference === 'string' ? data.paymentReference.trim().slice(0, 160) : '';
  const paymentNotes = typeof data.paymentNotes === 'string' ? data.paymentNotes.trim().slice(0, 1000) : '';
  if (!name || phone.length < 8 || whatsapp.length < 8 || !serviceId || !address || !area || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !duration || !Number.isInteger(workers) || workers < 1 || workers > 100 || !Number.isFinite(amount) || amount <= 0 || amount > 10000000 || !requirements) return badRequest('Fill all required customer, service, schedule, location and payment fields with valid values.');
  if (data.paymentStatus !== 'PAID') return badRequest('A booking can only be created after payment is marked PAID.');
  const service = await db.service.findFirst({ where: { id: serviceId, active: true } });
  if (!service) return badRequest('Select an active service.');
  const customerWhatsapp = whatsapp || phone;
  for (let attempt = 0; attempt < 5; attempt++) {
    const bookingNumber = `OC-${randomInt(10000, 999999)}`;
    const trackingToken = randomBytes(32).toString('base64url');
    try {
      const booking = await db.$transaction(async tx => {
        const customer = await tx.customer.upsert({ where: { phone }, update: { fullName: name, whatsapp: customerWhatsapp }, create: { fullName: name, phone, whatsapp: customerWhatsapp } });
        const created = await tx.booking.create({ data: {
          bookingNumber, trackingToken, customerId: customer.id, serviceId, address, area, mapLink: mapLink || null,
          serviceDate: new Date(`${date}T00:00:00.000Z`), serviceTime: time, duration, numberOfWorkers: workers, requirements,
          amount, paymentStatus: 'PAID', paymentReference: paymentReference || null, paymentNotes: paymentNotes || null,
          paymentVerifiedById: admin.id, paymentVerifiedAt: new Date(), createdById: admin.id,
          status: 'CONFIRMED', statusHistory: { create: { previousStatus: null, newStatus: 'CONFIRMED', changedById: admin.id } },
        }, include: { customer: true, service: true } });
        await tx.auditLog.create({ data: { adminId: admin.id, action: 'CREATE_BOOKING', entity: 'Booking', entityId: created.id, details: { bookingNumber, paymentStatus: 'PAID' } } });
        return created;
      });
      return NextResponse.json(booking, { status: 201 });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') continue;
      throw error;
    }
  }
  return NextResponse.json({ error: 'Could not create a unique booking. Please try again.' }, { status: 503 });
}
