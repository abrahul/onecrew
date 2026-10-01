import type { MetadataRoute } from 'next';
import { business } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/services', '/about', '/careers', '/faq', '/contact', '/privacy', '/terms'];
  return routes.map(path => ({ url: `${business.siteUrl}${path}`, lastModified: new Date(), changeFrequency: path === '' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.7 }));
}
