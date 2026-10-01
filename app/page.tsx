import type { Metadata } from 'next';
import { Hero, CategorySection, RhythmSection, HowItWorks, WhySection, BusinessSection, JoinSection, TrackSection, EmergencySection, FAQPreview } from '@/components/home-sections';
import { WhatsAppCTA } from '@/components/whatsapp-cta';

export const metadata: Metadata = { title: 'Workforce for Homes & Businesses', description: 'Reliable workers for home services, daily labour, skilled jobs and business support. Book your workforce through WhatsApp with ONECREW.' };
export default function Home() {
  return <><Hero /><div className="trust-strip"><div className="wrap trust-inner"><span>One crew for</span><b>HOME</b><i/><b>BUSINESS</b><i/><b>EVERYDAY</b><i/><b>ON-DEMAND</b></div></div><CategorySection /><RhythmSection /><HowItWorks /><WhySection /><BusinessSection /><EmergencySection /><JoinSection /><FAQPreview /><TrackSection /><section className="closing-cta"><div className="wrap closing-inner"><div><span className="eyebrow">Whenever the work calls</span><h2>Let’s find your<br/><em>extra pair of hands.</em></h2></div><WhatsAppCTA /></div></section></>;
}
