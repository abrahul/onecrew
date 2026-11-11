import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/page-intro';
import { business } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms for ONECREW workforce enquiries, bookings, payments, WhatsApp communication and career applications.',
};

export default function Terms() {
  return <>
    <PageIntro eyebrow="Legal" title="Terms & conditions" copy="The terms that apply when you use ONECREW services, website or WhatsApp support." />
    <section className="inner-content legal-page"><div className="wrap prose">
      <p><strong>Effective date: 11 November 2026</strong></p>
      <h2>About ONECREW</h2>
      <p>ONECREW is a workforce coordination service in {business.serviceArea}. We help customers request home-service, skilled, daily-labour and business-support workers. Service availability depends on location, timing, worker availability and the job requirements.</p>
      <h2>Enquiries and bookings</h2>
      <p>Sending a website or WhatsApp enquiry does not confirm a worker, price or booking. A booking becomes official only after ONECREW confirms availability, communicates the applicable price and an administrator verifies any required payment.</p>
      <h2>Prices and payments</h2>
      <p>Any quote is based on the information supplied and may change if the scope, duration, location or worker count changes. Use only payment instructions confirmed through ONECREW’s official contact channels. A payment message or receipt sent by a customer is subject to manual verification.</p>
      <h2>Customer responsibilities</h2>
      <p>Customers must provide accurate job and access details, maintain a lawful and reasonably safe work environment, provide necessary site permissions, and treat workers respectfully. ONECREW may decline or stop unsafe, unlawful, abusive or materially misdescribed work.</p>
      <h2>Changes, cancellations and refunds</h2>
      <p>Cancellation timing affects eligibility for a refund because workers may already be assigned or travelling. Full rules are in our <Link href="/cancellation-refunds">cancellation and refund policy</Link>.</p>
      <h2>WhatsApp communication</h2>
      <p>By starting a WhatsApp conversation, you consent to replies about your enquiry or booking. Type <strong>STOP</strong> to stop automated messages. Type <strong>HELP</strong> for a human-support route. You may also call {business.phone} or email <a href={`mailto:${business.email}`}>{business.email}</a>.</p>
      <h2>Careers</h2>
      <p>A career application expresses interest only. It does not guarantee employment, placement, work frequency or income. Applicants must provide accurate information and may withdraw an application by contacting us.</p>
      <h2>Service limitations</h2>
      <p>We take reasonable care in coordinating services, but timing can be affected by worker availability, traffic, weather, site access and other circumstances outside reasonable control. Nothing in these terms removes rights that cannot legally be excluded under applicable Indian law.</p>
      <h2>Contact</h2>
      <p>Questions, support requests or complaints: <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a>, <a href={`mailto:${business.email}`}>{business.email}</a>, or {business.address}.</p>
    </div></section>
  </>;
}
