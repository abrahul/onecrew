import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { business } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ONECREW collects, uses, shares and protects customer, WhatsApp and career application information.',
};

export default function Privacy() {
  return <>
    <PageIntro eyebrow="Legal" title="Privacy policy" copy="How ONECREW handles information shared through our website, WhatsApp and service operations." />
    <section className="inner-content legal-page"><div className="wrap prose">
      <p><strong>Effective date: 11 November 2026</strong></p>
      <h2>Who we are</h2>
      <p>ONECREW is a workforce coordination service operating from {business.address}. Privacy questions and requests can be sent to <a href={`mailto:${business.email}`}>{business.email}</a> or made by calling <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a>.</p>
      <h2>Information we collect</h2>
      <p>We may collect your name, phone number, email, location, service requirements, preferred date and time, booking and payment-verification details, messages, attachments and customer-support history. Career applications may include work history, profession, preferred work location, identity details and optional documents such as a résumé or licence images.</p>
      <h2>WhatsApp information</h2>
      <p>When you message ONECREW on WhatsApp, we receive your WhatsApp phone number, profile name, messages, message identifiers and any media you choose to send. Automated replies may collect enquiry details. A human team member can review the conversation and is required to verify payments and create official bookings.</p>
      <h2>How we use information</h2>
      <p>We use information to answer enquiries, provide quotes, coordinate workers, verify payments, manage bookings, provide support, review career applications, prevent misuse and meet legal obligations. We do not sell personal information.</p>
      <h2>Sharing and service providers</h2>
      <p>Information may be processed by providers needed to operate the service, including Meta/WhatsApp, website hosting, database, file-storage and communications providers. We may also share relevant booking details with assigned workers, or disclose information when required by law. We limit sharing to what is reasonably needed for the stated purpose.</p>
      <h2>Storage, retention and security</h2>
      <p>We use reasonable technical and organisational safeguards. No online system is completely risk-free. We keep information only as long as needed for service, recruitment, support, security, accounting or legal purposes, then delete or anonymise it when reasonably possible.</p>
      <h2>Your choices</h2>
      <p>You may ask to access, correct or delete information, subject to legal and operational requirements. To stop WhatsApp automation, type <strong>STOP</strong>. To reach a person, type <strong>HELP</strong>, call {business.phone}, or email <a href={`mailto:${business.email}`}>{business.email}</a>.</p>
      <h2>Private booking links</h2>
      <p>A customer tracking link may show limited booking status to anyone holding that link. Keep it private and tell us if you believe it has been exposed.</p>
      <h2>Policy updates</h2>
      <p>We may update this policy as our services or legal obligations change. The effective date above shows the latest version.</p>
    </div></section>
  </>;
}
