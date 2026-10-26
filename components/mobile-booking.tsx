import { whatsappUrl } from '@/lib/config';
import { ChatIcon } from './chat-icon';
export function MobileBooking() { return <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="mobile-booking"><ChatIcon /> Find your crew on WhatsApp <b aria-hidden="true">↗</b></a>; }
