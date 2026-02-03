/**
 * Centralized SEO configuration for Bazaarwale
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bazaarwale.in';

export const SITE_NAME = 'Bazaarwale';
export const SITE_DESCRIPTION =
  'Your trusted B2B wholesale partner. Quality products, competitive pricing, and exceptional service for businesses across India.';

export const DEFAULT_OG_IMAGE = '/logo.png';
export const TWITTER_HANDLE = '@bazaarwale';
export const TWITTER_CARD = 'summary_large_image' as const;

/** Build absolute URL for OG images and canonical links */
export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
