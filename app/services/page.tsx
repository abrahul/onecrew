import type { Metadata } from 'next';
import { categories } from '@/lib/content';
import { PageIntro } from '@/components/page-intro';
import { whatsappUrl } from '@/lib/config';
import { Arrow } from '@/components/brand';
import { WhatsAppCTA } from '@/components/whatsapp-cta';
export const metadata: Metadata = { title: 'Services', description: 'Explore ONECREW home services, daily labour, skilled workforce and business support.' };
export default function Services() { return <><PageIntro eyebrow="Our services" title="The right people for the work ahead." copy="Whatever the job looks like, ONECREW helps connect homes and businesses with the workforce they need." /><section className="inner-content"><div className="wrap"><div className="service-category-list">{categories.map((c,i) => <section className="service-group" key={c.title} id={`category-${i}`}><div className="service-group-head"><span className="eyebrow">{c.number} / Workforce category</span><h2>{c.title}</h2><p>{c.intro}</p></div><div className="service-list">{c.items.map((item,j) => <article className="service-row" key={item}><span className="service-row-number">{String(j+1).padStart(2,'0')}</span><h3>{item}</h3><a href={whatsappUrl(`Hi ONECREW, I need ${item.toLowerCase()}.`)} target="_blank" rel="noreferrer">Book this service <Arrow diagonal /></a></article>)}</div></section>)}</div><div className="service-bottom-cta"><span>Have a different requirement?</span><WhatsAppCTA>Tell us what you need</WhatsAppCTA></div></div></section></>; }
