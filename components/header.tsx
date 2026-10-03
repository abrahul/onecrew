'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brand } from './brand';
import { WhatsAppCTA } from './whatsapp-cta';

const links = [['Services', '/services'], ['How it works', '/#how-it-works'], ['About', '/about'], ['Careers', '/careers'], ['FAQ', '/faq'], ['Contact', '/contact']];
export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('menu-is-open', open);
    return () => document.body.classList.remove('menu-is-open');
  }, [open]);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  return <header className="site-header"><button className={`mobile-nav-backdrop ${open ? 'is-visible' : ''}`} aria-label="Close navigation" onClick={() => setOpen(false)} /><div className="header-inner wrap"><Brand />
    <nav className={`main-nav ${open ? 'nav-open' : ''}`} aria-label="Main navigation">
      <Link href="/" onClick={() => setOpen(false)}>Home</Link>{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      <div className="mobile-nav-cta"><WhatsAppCTA>Book a Worker</WhatsAppCTA><Link className="mobile-join" href="/careers" onClick={() => setOpen(false)}>Join ONECREW <span>→</span></Link></div>
    </nav>
    <div className="header-actions"><Link className="join-link" href="/careers">Join ONECREW <span>↗</span></Link><WhatsAppCTA className="header-book">Book a Worker</WhatsAppCTA></div>
    <button className={`menu-toggle ${open ? 'is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}><span/><span/></button>
  </div></header>;
}
