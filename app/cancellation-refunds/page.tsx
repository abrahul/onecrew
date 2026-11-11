import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { business } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'ONECREW cancellation, rescheduling and refund rules for confirmed workforce bookings.',
};

export default function CancellationRefunds() {
  return <>
    <PageIntro eyebrow="Customer policy" title="Cancellation & refunds" copy="Clear rules for cancelling, rescheduling or requesting a refund for a confirmed ONECREW booking." />
    <section className="inner-content legal-page"><div className="wrap prose">
      <p><strong>Effective date: 11 November 2026</strong></p>
      <h2>Before a booking is confirmed</h2>
      <p>An enquiry is not a booking. You may cancel an unconfirmed enquiry at any time without a charge.</p>
      <h2>Customer cancellations</h2>
      <ul>
        <li><strong>Before a worker is assigned:</strong> 100% of any amount paid will be refunded.</li>
        <li><strong>After assignment and more than 6 hours before arrival:</strong> 80% will be refunded; 20% covers coordination and worker reservation costs.</li>
        <li><strong>Within 6 hours of arrival:</strong> the payment is normally non-refundable.</li>
        <li><strong>After dispatch or arrival:</strong> the payment is non-refundable if the customer cancels, is unavailable, denies access or supplied materially incorrect job details.</li>
      </ul>
      <h2>Rescheduling</h2>
      <p>One free reschedule may be requested more than 6 hours before the planned arrival, subject to worker availability. Later changes may be treated as a cancellation and new booking.</p>
      <h2>If ONECREW cancels</h2>
      <p>If ONECREW cannot provide the confirmed service, you may choose a full refund or a rescheduled service without an extra coordination charge.</p>
      <h2>Service concerns</h2>
      <p>Report a worker no-show, incomplete service or serious service concern within 24 hours of the scheduled service. We will review booking records and may offer a full or proportionate refund, correction or replacement where appropriate.</p>
      <h2>How to request cancellation or refund</h2>
      <p>Call <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a> or email <a href={`mailto:${business.email}`}>{business.email}</a>. Include your name, phone number, booking reference, service date and reason. Do not send card, PIN or password information.</p>
      <h2>Refund timing</h2>
      <p>Approved refunds are initiated to the original payment method within 5–10 business days. Banks and payment providers may take additional time to display the credit. These rules do not limit any non-excludable rights under applicable Indian consumer law.</p>
    </div></section>
  </>;
}
