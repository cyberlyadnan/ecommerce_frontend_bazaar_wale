'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Wallet, Receipt, Loader2, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';
import { vendorListPayouts, vendorPaymentsSummary, type PayoutDto, type PayoutStatus } from '@/services/paymentsApi';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

function statusBadge(status: PayoutStatus) {
  const cls =
    status === 'paid'
      ? 'bg-emerald-500/10 text-emerald-600'
      : status === 'processing'
        ? 'bg-primary/10 text-primary'
        : status === 'rejected'
          ? 'bg-rose-500/10 text-rose-600'
          : 'bg-amber-500/10 text-amber-600';
  const Icon = status === 'paid' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  );
}

export default function VendorPaymentsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [tab, setTab] = useState<'pending' | 'paid' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ totalPaid: number; totalPending: number; lifetimeGross: number; lifetimeCommission: number } | null>(null);
  const [payouts, setPayouts] = useState<PayoutDto[]>([]);

  const statusParam = useMemo(() => (tab === 'all' ? 'all' : tab), [tab]);

  const load = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const [sum, list] = await Promise.all([
        vendorPaymentsSummary(accessToken),
        vendorListPayouts(accessToken, statusParam as any),
      ]);
      setSummary(sum.summary);
      const items = list.payouts || [];
      const term = search.trim().toLowerCase();
      setPayouts(
        term
          ? items.filter((p) => (p.paymentReference || '').toLowerCase().includes(term) || (p.adminNotes || '').toLowerCase().includes(term))
          : items,
      );
    } catch (e) {
      console.error('Failed to load vendor payments:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, statusParam]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Payments & settlements</h1>
        <p className="text-sm text-muted">
          Track your payouts, commission deductions, and settlement history.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted/80">Total paid</p>
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <Wallet size={16} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {formatCurrency(summary?.totalPaid ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted">Settled payouts</p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted/80">Pending / processing</p>
            <span className="rounded-full bg-sky-500/10 p-2 text-sky-600">
              <Receipt size={16} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {formatCurrency(summary?.totalPending ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted">Awaiting settlement</p>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted/80">Commission deducted</p>
            <span className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
              <CalendarRange size={16} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {formatCurrency(summary?.lifetimeCommission ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-muted">Lifetime</p>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payouts</h2>
            <p className="text-xs text-muted">Admin updates payout status, mode, and reference.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl border border-border bg-background p-1">
              {(['pending', 'paid', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    tab === t ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'paid' ? 'Paid' : 'Pending'}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') load();
                }}
                placeholder="Search reference/notes…"
                className="pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm"
              />
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
            >
              Refresh
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="ml-3 font-semibold">Loading payouts…</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-10 text-center text-muted">No payouts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-muted/20 text-muted">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Net amount</th>
                  <th className="px-5 py-3 text-left font-medium">Commission</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Mode</th>
                  <th className="px-5 py-3 text-left font-medium">Paid on</th>
                  <th className="px-5 py-3 text-left font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/10">
                    <td className="px-5 py-4 font-semibold text-foreground">{formatCurrency(p.netAmount ?? p.amount)}</td>
                    <td className="px-5 py-4 text-muted">
                      {formatCurrency(p.commissionAmount ?? 0)}{' '}
                      <span className="text-xs text-muted/70">({p.commissionPercent ?? 0}%)</span>
                    </td>
                    <td className="px-5 py-4">{statusBadge(p.status)}</td>
                    <td className="px-5 py-4 text-muted">{p.paymentMode || 'bank'}</td>
                    <td className="px-5 py-4 text-muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4 text-muted">{p.paymentReference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


