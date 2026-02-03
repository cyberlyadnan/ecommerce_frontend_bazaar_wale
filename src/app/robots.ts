import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/vendor/', '/auth/', '/api/', '/checkout', '/cart', '/profile', '/orders', '/favorites'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/vendor/', '/auth/', '/api/', '/checkout', '/cart', '/profile', '/orders', '/favorites'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
