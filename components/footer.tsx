import Link from 'next/link';
import { business, whatsappUrl } from '@/lib/config';
import { Brand } from './brand';

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-top"><div className="footer-brand-col"><Brand light /><p>Making it easier for homes and businesses to find the helping hands they need.</p><a href={whatsappUrl()} target="_blank" rel="noreferrer" className="footer-chat">Start a conversation <span>↗</span></a></div>
    <div className="footer-col"><h3>Explore</h3><Link href="/services">Home Services</Link><Link href="/services">Daily Labour</Link><Link href="/services">Skilled Workforce</Link><Link href="/services">Business Support</Link><Link href="/#urgent">Emergency Workforce</Link></div>
    <div className="footer-col"><h3>Company</h3><Link href="/about">About us</Link><Link href="/careers">Careers</Link><Link href="/faq">FAQs</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div>
    <div className="footer-col footer-contact"><h3>Say hello</h3><a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a><a href={whatsappUrl()} target="_blank" rel="noreferrer">WhatsApp us</a><a href={`mailto:${business.email}`}>{business.email}</a><span>{business.serviceArea}</span><span>{business.hours}</span></div>
  </div><div className="wrap footer-bottom"><span>© 2026 ONECREW. All rights reserved.</span><span>People power, thoughtfully connected.</span></div></footer>;
}
