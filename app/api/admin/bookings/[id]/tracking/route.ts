import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authenticatedAdmin, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const trackingToken = randomBytes(32).toString('base64url');
  const booking = await db.booking.update({ where: { id: context.params.id }, data: { trackingToken }, select: { id: true, bookingNumber: true, trackingToken: true } }).catch(() => null);
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  await db.auditLog.create({ data: { adminId: admin.id, action: 'ROTATE_TRACKING_TOKEN', entity: 'Booking', entityId: booking.id } });
  return NextResponse.json(booking);
}
