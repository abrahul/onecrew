import { MockWhatsAppProvider } from './mock-provider';
import { MetaWhatsAppProvider } from './meta-provider';
import type { WhatsAppProvider } from './provider';
export function getWhatsAppProvider():WhatsAppProvider {
  const provider=process.env.WHATSAPP_PROVIDER ?? 'mock';
  if (provider==='meta') return new MetaWhatsAppProvider();
  if (provider==='mock' && process.env.NODE_ENV!=='production') return new MockWhatsAppProvider();
  throw new Error('WhatsApp provider is not configured');
}
