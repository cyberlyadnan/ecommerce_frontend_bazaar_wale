'use client';

import Link from 'next/link';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function VendorDashboardPage() {
  return (
    <AuthGuard allowedRoles={['vendor']}>
      <div className="grid" style={{ gap: '2rem' }}>
        <header>
          <div className="badge muted">Vendor workspace</div>
          <h1 style={{ marginTop: '0.75rem', fontSize: '2.5rem' }}>Grow your wholesale pipeline</h1>
          <p className="muted" style={{ marginTop: '0.5rem', maxWidth: '42rem' }}>
            Track bulk orders, manage catalogue updates, and coordinate fulfilment with the admin
            warehouse.
          </p>
        </header>

        <section className="grid" style={{ gap: '1.5rem' }}>
          <article className="card surface" style={{ padding: '1.75rem' }}>
            <h2 style={{ margin: 0 }}>Catalogue management</h2>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Keep pricing, minimum order quantities, and stock positions up to date.
            </p>
            <Link href="/vendor/products" className="btn" style={{ marginTop: '1.25rem' }}>
              Manage products
            </Link>
          </article>

          <article className="card surface" style={{ padding: '1.75rem' }}>
            <h2 style={{ margin: 0 }}>Orders in transit</h2>
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Coordinate deliveries to the admin hub and monitor pending payouts.
            </p>
            <Link href="/vendor/orders" className="btn outlined" style={{ marginTop: '1.25rem' }}>
              View order board
            </Link>
          </article>
        </section>
      </div>
    </AuthGuard>
  );
}


