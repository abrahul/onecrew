import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from './brand';
import { WhatsAppCTA } from './whatsapp-cta';
import { whatsappUrl } from '@/lib/config';

export function HomeHero() {
  return <section className="welcome-hero">
    <div className="wrap welcome-grid">
      <div className="welcome-copy">
        <span className="welcome-kicker"><i /> YOUR EVERYDAY WORKFORCE PARTNER</span>
        <h1>A little help.<br />A lot <span>done.</span></h1>
        <p>The right hands for your home, your work, and everything in between. Tell us what you need. We’ll take it from there.</p>
        <div className="welcome-actions"><WhatsAppCTA>Find your crew</WhatsAppCTA><Link href="/services" className="welcome-explore">Explore services <Arrow /></Link></div>
        <div className="welcome-reassurance"><span>No account needed</span><span>Real people, ready to help</span></div>
        <div className="welcome-popular"><span>POPULAR REQUESTS</span><div>{['Electrician', 'Home cleaning', 'Moving help'].map(service => <a key={service} href={whatsappUrl(`Hi ONECREW, I need ${service.toLowerCase()}.`)} target="_blank" rel="noreferrer">{service}<Arrow diagonal /></a>)}</div></div>
      </div>
      <div className="welcome-scene">
        <div className="welcome-photo"><Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85" alt="Construction professionals working together on site" fill priority sizes="(max-width: 680px) 100vw, 50vw" /><div className="welcome-photo-shade" /><div className="welcome-photo-caption"><span>GOOD PEOPLE. GOOD WORK.</span><p>Big jobs.<br />Everyday heroes.</p></div><span className="welcome-photo-tag">ONECREW <Arrow diagonal /></span></div>
        <div className="enquiry-preview"><div className="enquiry-preview-head"><span className="enquiry-symbol" aria-hidden="true">✳</span><div><b>Your next job, sorted.</b><span>Start with a simple message</span></div><span className="enquiry-dot" /></div><div className="enquiry-bubble">Hi! I need an electrician for my home.</div><div className="enquiry-answer">We can help. Where and when do you need them?</div><div className="enquiry-preview-foot"><span>Share your need. We’ll handle the next steps.</span><Arrow diagonal /></div></div>
        <span className="welcome-side-note" aria-hidden="true">A CREW FOR EVERY KIND OF DAY</span>
      </div>
    </div>
    <div className="wrap welcome-bottom"><span>From quick fixes to bigger plans.</span><a href="#services">Find the help you need <span aria-hidden="true">↓</span></a></div>
  </section>;
}
