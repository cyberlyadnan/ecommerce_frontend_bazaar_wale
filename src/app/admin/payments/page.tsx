'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Plus, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';
import {
  adminCreatePayout,
  adminListPayouts,
  adminUpdatePayout,
  getAdminCommission,
  updateAdminCommission,
  type PayoutDto,
  type PayoutStatus,
  type PaymentMode,
} from '@/services/paymentsApi';

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

  const Icon =
    status === 'paid' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [tab, setTab] = useState<'pending' | 'paid' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [commissionPercent, setCommissionPercent] = useState<number>(5);
  const [savingCommission, setSavingCommission] = useState(false);

  const [payouts, setPayouts] = useState<PayoutDto[]>([]);

  // simple create payout form (manual)
  const [creating, setCreating] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');

  const statusParam = useMemo(() => {
    if (tab === 'all') return 'all';
    return tab;
  }, [tab]);

  const load = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const [comm, list] = await Promise.all([
        getAdminCommission(accessToken),
        adminListPayouts(accessToken, { status: statusParam as any, search: search.trim() || undefined }),
      ]);
      setCommissionPercent(comm.commissionPercent ?? 0);
      setPayouts(list.payouts || []);
    } catch (e) {
      console.error('Failed to load admin payments:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, statusParam]);

  const saveCommission = async () => {
    if (!accessToken) return;
    try {
      setSavingCommission(true);
      setError(null);
      const res = await updateAdminCommission(Number(commissionPercent), accessToken);
      setCommissionPercent(res.commissionPercent);
    } catch (e) {
      console.error('Failed to update commission:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to update commission.');
    } finally {
      setSavingCommission(false);
    }
  };

  const createPayout = async () => {
    if (!accessToken) return;
    try {
      setCreating(true);
      setError(null);
      await adminCreatePayout(
        {
          vendorId: vendorId.trim(),
          grossAmount: Number(grossAmount),
          paymentMode,
          adminNotes: notes.trim() || undefined,
          paymentReference: reference.trim() || undefined,
        },
        accessToken,
      );
      setVendorId('');
      setGrossAmount(0);
      setNotes('');
      setReference('');
      await load();
    } catch (e) {
      console.error('Failed to create payout:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to create payout.');
    } finally {
      setCreating(false);
    }
  };

  const markPaid = async (payoutId: string) => {
    if (!accessToken) return;
    try {
      setError(null);
      await adminUpdatePayout(payoutId, { status: 'paid' }, accessToken);
      await load();
    } catch (e) {
      console.error('Failed to update payout:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to update payout.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payments & settlements</h1>
          <p className="text-sm text-muted">
            Set commission, create vendor payout entries, and track pending/paid settlements.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Commission settings</h2>
              <p className="text-xs text-muted">Admin commission is applied when creating payouts.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <span className="text-sm text-muted">%</span>
              <button
                onClick={saveCommission}
                disabled={savingCommission}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savingCommission ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Create payout</h2>
          <p className="mt-1 text-xs text-muted">Manual entry (vendorId + gross amount).</p>

          <div className="mt-4 space-y-3">
            <input
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Vendor ObjectId"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={0}
              value={grossAmount}
              onChange={(e) => setGrossAmount(Number(e.target.value))}
              placeholder="Gross amount (₹)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Payment reference (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Admin notes (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm min-h-[90px]"
            />

            <button
              onClick={createPayout}
              disabled={creating || !vendorId.trim() || grossAmount <= 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create payout
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <header className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payouts</h2>
            <p className="text-xs text-muted">Manage payout status, payment mode, references and notes.</p>
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
                placeholder="Search vendor or reference…"
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
                  <th className="px-5 py-3 text-left font-medium">Vendor</th>
                  <th className="px-5 py-3 text-left font-medium">Gross</th>
                  <th className="px-5 py-3 text-left font-medium">Commission</th>
                  <th className="px-5 py-3 text-left font-medium">Net</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Mode</th>
                  <th className="px-5 py-3 text-left font-medium">Paid on</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payouts.map((p) => {
                  const vendorName =
                    (p.vendorId as any)?.businessName || (p.vendorId as any)?.name || 'Vendor';
                  return (
                    <tr key={p._id} className="hover:bg-muted/10">
                      <td className="px-5 py-4 font-semibold text-foreground">{vendorName}</td>
                      <td className="px-5 py-4 text-muted">{formatCurrency(p.grossAmount ?? 0)}</td>
                      <td className="px-5 py-4 text-muted">
                        {formatCurrency(p.commissionAmount ?? 0)}{' '}
                        <span className="text-xs text-muted/70">({p.commissionPercent ?? 0}%)</span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">{formatCurrency(p.netAmount ?? p.amount)}</td>
                      <td className="px-5 py-4">{statusBadge(p.status)}</td>
                      <td className="px-5 py-4 text-muted">{p.paymentMode || 'bank'}</td>
                      <td className="px-5 py-4 text-muted">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {p.status !== 'paid' ? (
                          <button
                            onClick={() => markPaid(p._id)}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


