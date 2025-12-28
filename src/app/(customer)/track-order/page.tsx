'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PackageSearch, ArrowRight, Truck, CheckCircle2, Clock } from 'lucide-react';

import { SupportPageLayout } from '@/components/pages/support/SupportPageLayout';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => orderId.trim().length >= 4, [orderId]);

  return (
    <SupportPageLayout
      badge="Orders"
      title="Track Order"
      subtitle="Enter your order ID and contact details to track shipment progress."
    >
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <PackageSearch className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground">Track your shipment</h2>
            <p className="text-sm text-foreground/60 mt-1">
              This is a UI placeholder (connect to your backend later). We’ll validate and show the latest status.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-foreground/60">
              Order ID
            </label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. BW-10234"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-foreground/60">
              Email or Phone (optional)
            </label>
            <input
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="Email or phone used at checkout"
              className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            disabled={!canSubmit}
            onClick={() => setSubmitted(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Track
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border bg-surface text-foreground font-semibold hover:bg-muted/30 transition"
          >
            View my orders
          </Link>
        </div>
      </div>

      {submitted && (
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-foreground">Latest status</h3>
          <p className="text-sm text-foreground/60 mt-1">
            Showing demo status for <span className="font-semibold text-foreground">{orderId.trim()}</span>
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Confirmed
              </div>
              <p className="text-xs text-foreground/60 mt-2">Order received and confirmed.</p>
            </div>
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Truck className="w-4 h-4" />
                In transit
              </div>
              <p className="text-xs text-foreground/60 mt-2">Your package is on the way.</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 text-foreground/70 font-semibold">
                <Clock className="w-4 h-4" />
                Delivered
              </div>
              <p className="text-xs text-foreground/60 mt-2">Pending delivery confirmation.</p>
            </div>
          </div>
        </div>
      )}
    </SupportPageLayout>
  );
}


