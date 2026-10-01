import type { Metadata } from 'next';
import { PageIntro } from '@/components/page-intro';
import { FAQList } from '@/components/faq-list';
import { WhatsAppCTA } from '@/components/whatsapp-cta';
import { faqs } from '@/lib/content';
export const metadata: Metadata = { title: 'Frequently Asked Questions', description: 'Answers about ONECREW worker bookings, business support and work opportunities.' };
export default function FAQ() { const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q,a]) => ({ '@type': 'Question', name:q, acceptedAnswer:{ '@type':'Answer', text:a } })) }; return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><PageIntro eyebrow="Frequently asked questions" title="A few things you might be wondering." copy="Quick answers about requesting workforce, hiring for business and joining the ONECREW network."/><section className="inner-content faq-page"><div className="wrap faq-page-grid"><div><span className="eyebrow">Still have a question?</span><h2>We’re just a message away.</h2><p>Tell our team what you’d like to know. We’ll help point you in the right direction.</p><WhatsAppCTA>Ask us on WhatsApp</WhatsAppCTA></div><FAQList /></div></section></>; }
