import type { MetadataRoute } from 'next';
import { business } from '@/lib/config';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }, sitemap: `${business.siteUrl}/sitemap.xml` };
}
