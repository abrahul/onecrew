import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BookingStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { Brand } from '@/components/brand';
import { business, whatsappUrl } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const metadata: Metadata = { title: 'Your Booking', robots: { index: false, follow: false } };
const steps: BookingStatus[] = ['CONFIRMED', 'ASSIGNED', 'WORKER_ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED'];
const labels: Record<BookingStatus, string> = { CONFIRMED: 'Booking confirmed', ASSIGNED: 'Worker assigned', WORKER_ON_THE_WAY: 'Worker on the way', WORK_STARTED: 'Work started', WORK_COMPLETED: 'Work completed', CANCELLED: 'Booking cancelled' };
const dateText = (date: Date) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
const workerTypeText: Record<string, string> = { SKILLED_WORKER: 'Skilled worker', GENERAL_LABOUR: 'General worker', TEMPORARY_WORKER: 'Temporary worker', EMERGENCY_WORKER: 'Emergency worker', OTHER: 'ONECREW worker' };
export default async function TrackingPage({ params }: { params: { token: string } }) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(params.token)) notFound();
  const booking = await db.booking.findUnique({ where: { trackingToken: params.token }, select: { bookingNumber: true, status: true, serviceDate: true, serviceTime: true, area: true, address: true, updatedAt: true, service: { select: { name: true } }, assignedWorker: { select: { fullName: true, workerType: true } }, statusHistory: { select: { newStatus: true, timestamp: true }, orderBy: { timestamp: 'asc' } } } });
  if (!booking) notFound();
  const activeIndex = steps.indexOf(booking.status);
  return <section className="tracking-page"><div className="tracking-wrap"><header className="tracking-header"><Brand/><span>SECURE BOOKING TRACKING</span></header><section className="tracking-card"><div className="tracking-card-head"><span className="eyebrow"><i/> Your ONECREW booking</span><span className={`status-pill status-${booking.status.toLowerCase()}`}>{labels[booking.status]}</span></div><p className="tracking-id">BOOKING ID <b>{booking.bookingNumber}</b></p><h1>{booking.service.name}</h1><div className="tracking-details"><div><small>Date</small><b>{dateText(booking.serviceDate)}</b></div><div><small>Time</small><b>{booking.serviceTime}</b></div><div><small>Location</small><b>{booking.area}</b></div></div>{booking.address && <p className="tracking-address">{booking.address}</p>}
    {booking.status === 'CANCELLED' ? <div className="cancelled-note">This booking has been cancelled. Contact ONECREW on WhatsApp if you have any questions.</div> : <section className="tracking-progress"><h2>Job progress</h2><div className="progress-list">{steps.map((step, index) => {
      const reached = activeIndex >= 0 ? index <= activeIndex : booking.statusHistory.some(x => x.newStatus === step);
      const current = step === booking.status;
      const changed = booking.statusHistory.filter(x => x.newStatus === step).at(-1);
      return <div className={`progress-item ${reached ? 'reached' : ''} ${current ? 'current' : ''}`} key={step}><span className="progress-dot">{reached ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>{labels[step]}</b>{changed && <small>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(changed.timestamp)}</small>}</div></div>;
    })}</div></section>}
    {booking.assignedWorker && <section className="tracking-worker"><span className="worker-avatar">{booking.assignedWorker.fullName.slice(0, 1)}</span><div><small>Your assigned worker</small><b>{booking.assignedWorker.fullName}</b><span>{workerTypeText[booking.assignedWorker.workerType] ?? 'ONECREW worker'}</span></div></section>}
    <p className="tracking-updated">Last updated {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: business.timeZone }).format(booking.updatedAt)}</p>
  </section><footer className="tracking-footer"><p>Need help with your booking?</p><a href={whatsappUrl(`Hi ONECREW, I need an update on booking ${booking.bookingNumber}.`)} target="_blank" rel="noreferrer">Message ONECREW ↗</a><small>Your tracking link is private. Please don’t share it publicly. {business.name}</small></footer></div></section>;
}
