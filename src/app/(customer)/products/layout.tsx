import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All Products',
  description:
    'Browse our complete catalog of B2B wholesale products. Quality goods at competitive prices for your business.',
  openGraph: {
    title: `All Products | ${SITE_NAME}`,
    description: 'Browse our complete catalog of B2B wholesale products. Quality goods at competitive prices.',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
