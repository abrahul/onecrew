import type { Metadata } from 'next';
import './globals.css';
import './operations.css';
import './mobile.css';
import { PublicHeader, PublicFooter } from '@/components/public-chrome';
import { business } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: { default: 'ONECREW | Your Daily Workforce Partner', template: '%s | ONECREW' },
  description: 'Find dependable workforce for home services, daily labour, skilled jobs and business support. Tell ONECREW what you need on WhatsApp.',
  openGraph: { title: 'ONECREW | Your Daily Workforce Partner', description: 'A workforce partner for homes and businesses. Find the right people for the job with ONECREW.', url: business.siteUrl, siteName: 'ONECREW', locale: 'en_IN', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'ONECREW | Your Daily Workforce Partner', description: 'A workforce partner for homes and businesses.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: business.name, url: business.siteUrl, email: business.email, telephone: business.phone, description: 'ONECREW connects homes and businesses with workforce for everyday tasks, skilled jobs and temporary requirements.' };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><PublicHeader /><main>{children}</main><PublicFooter /></body></html>;
}
