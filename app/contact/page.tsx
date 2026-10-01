import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { business } from '@/lib/config';
import { whatsappUrl } from '@/lib/config';
import { ContactForm } from '@/components/forms';
import { WhatsAppCTA } from '@/components/whatsapp-cta';
export const metadata: Metadata = { title: 'Contact ONECREW', description: 'Get in touch with ONECREW about workforce requests, business support or work opportunities.' };
export default function Contact() { return <><PageIntro eyebrow="Let’s talk" title="Tell us what’s on your mind." copy="Have a workforce requirement, a business enquiry or a question about working with ONECREW? We’d be glad to hear from you."/><section className="inner-content contact-page"><div className="wrap contact-grid"><aside className="contact-details"><span className="eyebrow">Get in touch</span><h2>A real conversation<br/><em>starts here.</em></h2><p>Choose what works for you. For booking requests, WhatsApp is the quickest place to start.</p><WhatsAppCTA>Chat with ONECREW</WhatsAppCTA><div className="contact-detail-list"><a href={`tel:${business.phone.replace(/[^+\d]/g,'')}`}><small>Call us</small><b>{business.phone}</b></a><a href={whatsappUrl()} target="_blank" rel="noreferrer"><small>WhatsApp</small><b>Start a chat ↗</b></a><a href={`mailto:${business.email}`}><small>Email</small><b>{business.email}</b></a><div><small>Service area</small><b>{business.serviceArea}</b></div><div><small>Business hours</small><b>{business.hours}</b></div></div></aside><ContactForm /></div></section></>; }
