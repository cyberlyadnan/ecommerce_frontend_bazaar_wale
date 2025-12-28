import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ReduxProvider } from '@/store/redux/ReduxProvider';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ecommerce Platform',
  description: 'Multi-tenant B2B ecommerce platform built with Next.js and Redux Toolkit.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}


