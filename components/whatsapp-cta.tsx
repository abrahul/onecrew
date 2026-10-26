import { whatsappUrl } from '@/lib/config';
import { Arrow } from './brand';
import { ChatIcon } from './chat-icon';

export function WhatsAppCTA({ children = 'Book a Worker on WhatsApp', message, className = '', icon = true }: { children?: React.ReactNode; message?: string; className?: string; icon?: boolean }) {
  return <a className={`button button-primary ${className}`} href={whatsappUrl(message)} target="_blank" rel="noreferrer">
    {icon && <span className="chat-icon"><ChatIcon /></span>}{children}<Arrow diagonal />
  </a>;
}
