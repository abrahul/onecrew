import { whatsappUrl } from '@/lib/config';
export function MobileBooking() { return <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="mobile-booking"><span aria-hidden="true">◉</span> Book a Worker on WhatsApp <b>↗</b></a>; }
