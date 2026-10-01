import { whatsappUrl } from '@/lib/config';
import { Arrow } from './brand';

export function WhatsAppCTA({ children = 'Book a Worker on WhatsApp', message, className = '', icon = true }: { children?: React.ReactNode; message?: string; className?: string; icon?: boolean }) {
  return <a className={`button button-primary ${className}`} href={whatsappUrl(message)} target="_blank" rel="noreferrer">
    {icon && <span aria-hidden="true" className="wa-mark">◉</span>}{children}<Arrow diagonal />
  </a>;
}
