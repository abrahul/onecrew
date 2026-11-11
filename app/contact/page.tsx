import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro } from '@/components/page-intro';
import { business, whatsappUrl } from '@/lib/config';
import { ContactForm } from '@/components/forms';
import { WhatsAppCTA } from '@/components/whatsapp-cta';

export const metadata: Metadata = {
  title: 'Contact & Customer Support',
  description: 'Contact ONECREW customer support in Thiruvananthapuram by phone, email or WhatsApp.',
};

export default function Contact() {
  return <>
    <PageIntro eyebrow="Contact & support" title="Talk to the ONECREW team." copy="Contact us about workforce requests, existing bookings, cancellations, refunds, complaints or work opportunities." />
    <section className="inner-content contact-page">
      <div className="wrap contact-grid">
        <aside className="contact-details">
          <span className="eyebrow">Verified business information</span>
          <h2>Real support,<br /><em>when you need it.</em></h2>
          <p>ONECREW is a workforce coordination service operating in Thiruvananthapuram, Kerala. WhatsApp is the quickest place to start a booking enquiry.</p>
          <WhatsAppCTA>Chat with ONECREW</WhatsAppCTA>
          <div className="contact-detail-list">
            <div><small>Business name</small><b>{business.legalName} ({business.name})</b></div>
            <div><small>Business activity</small><b>{business.businessType}</b></div>
            <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}><small>Customer support phone</small><b>{business.phone}</b></a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer"><small>WhatsApp</small><b>Start a chat ↗</b></a>
            <a href={`mailto:${business.email}`}><small>Customer support email</small><b>{business.email}</b></a>
            <div><small>Business address</small><b>{business.address}</b></div>
            <div><small>Service area</small><b>{business.serviceArea}</b></div>
            <div><small>Business hours</small><b>{business.hours}</b></div>
          </div>
          <p>For a confirmed booking cancellation or refund request, read our <Link href="/cancellation-refunds">cancellation and refund policy</Link>, then call or email us with your booking details.</p>
        </aside>
        <ContactForm />
      </div>
    </section>
  </>;
}
