'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Loader2, Save, Plus, Search, CheckCircle2, Clock, XCircle, ChevronDown, FileText } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';
import { Pagination } from '@/components/shared/Pagination';
import {
  adminCreatePayout,
  adminListPayouts,
  adminUpdatePayout,
  downloadPayoutSlipPdf,
  getAdminCommission,
  updateAdminCommission,
  type PayoutDto,
  type PayoutStatus,
  type PaymentMode,
} from '@/services/paymentsApi';
import { fetchVendors, type VendorDto } from '@/services/catalogApi';

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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // simple create payout form (manual)
  const [creating, setCreating] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorDto | null>(null);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorList, setVendorList] = useState<VendorDto[]>([]);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bank');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');
  const [downloadingSlipId, setDownloadingSlipId] = useState<string | null>(null);

  const statusParam = useMemo(() => {
    if (tab === 'all') return 'all';
    return tab;
  }, [tab]);

  const load = async (pageOverride?: number) => {
    if (!accessToken) return;
    const p = pageOverride ?? page;
    try {
      setLoading(true);
      setError(null);
      const [comm, list] = await Promise.all([
        getAdminCommission(accessToken),
        adminListPayouts(accessToken, {
          status: statusParam as any,
          search: search.trim() || undefined,
          limit: PAGE_SIZE,
          skip: (p - 1) * PAGE_SIZE,
        }),
      ]);
      setCommissionPercent(comm.commissionPercent ?? 0);
      setPayouts(list.payouts || []);
      setTotal(list.total ?? 0);
    } catch (e) {
      console.error('Failed to load admin payments:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accessToken, statusParam, page]);

  useEffect(() => {
    setPage(1);
  }, [statusParam]);

  const loadVendors = async (search: string) => {
    if (!accessToken) return;
    setLoadingVendors(true);
    try {
      const res = await fetchVendors(accessToken, {
        status: 'active',
        limit: 200,
        search: search.trim() || undefined,
      });
      setVendorList(res.vendors || []);
    } catch {
      setVendorList([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => loadVendors(vendorSearch), 300);
    return () => clearTimeout(t);
  }, [accessToken, vendorSearch]);

  useEffect(() => {
    if (vendorDropdownOpen && vendorList.length === 0 && !loadingVendors) loadVendors('');
  }, [vendorDropdownOpen]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(e.target as Node)) {
        setVendorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const filteredVendors = useMemo(() => {
    const term = vendorSearch.trim().toLowerCase();
    if (!term) return vendorList;
    return vendorList.filter(
      (v) =>
        (v.businessName || '').toLowerCase().includes(term) ||
        (v.name || '').toLowerCase().includes(term) ||
        (v.email || '').toLowerCase().includes(term),
    );
  }, [vendorList, vendorSearch]);

  const displayVendorLabel = (v: VendorDto) => v.businessName || v.name || v._id;

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
    if (!accessToken || !selectedVendor) return;
    try {
      setCreating(true);
      setError(null);
      await adminCreatePayout(
        {
          vendorId: selectedVendor._id,
          grossAmount: Number(grossAmount),
          paymentMode,
          adminNotes: notes.trim() || undefined,
          paymentReference: reference.trim() || undefined,
        },
        accessToken,
      );
      setSelectedVendor(null);
      setVendorSearch('');
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

  const handleDownloadSlip = async (payoutId: string) => {
    if (!accessToken) return;
    setDownloadingSlipId(payoutId);
    try {
      await downloadPayoutSlipPdf(payoutId, accessToken);
    } catch (e) {
      console.error('Failed to download slip:', e);
      setError(e instanceof Error ? e.message : 'Failed to download slip');
    } finally {
      setDownloadingSlipId(null);
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
          <p className="mt-1 text-xs text-muted">Select vendor by business name and enter gross amount.</p>

          <div className="mt-4 space-y-3">
            <div className="relative" ref={vendorDropdownRef}>
              <div className="flex rounded-xl border border-border bg-background overflow-hidden">
                <input
                  value={selectedVendor ? displayVendorLabel(selectedVendor) : vendorSearch}
                  onChange={(e) => {
                    setVendorSearch(e.target.value);
                    if (selectedVendor) setSelectedVendor(null);
                  }}
                  onFocus={() => setVendorDropdownOpen(true)}
                  placeholder="Search vendor by business name..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVendorDropdownOpen((o) => !o)}
                  className="px-2 text-muted hover:text-foreground border-l border-border"
                  aria-label="Toggle list"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              {vendorDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg max-h-56 overflow-y-auto">
                  {loadingVendors ? (
                    <div className="px-3 py-4 text-sm text-muted flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading vendors…
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted">No vendors found.</div>
                  ) : (
                    filteredVendors.map((v) => (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => {
                          setSelectedVendor(v);
                          setVendorSearch('');
                          setVendorDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 border-b border-border/60 last:border-0"
                      >
                        <span className="font-medium text-foreground">{displayVendorLabel(v)}</span>
                        {v.email && (
                          <span className="block text-xs text-muted truncate">{v.email}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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
              disabled={creating || !selectedVendor || grossAmount <= 0}
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
              onClick={() => {
                setPage(1);
                load(1);
              }}
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
                  <th className="px-5 py-3 text-left font-medium">Slip</th>
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
                        <button
                          type="button"
                          onClick={() => handleDownloadSlip(p._id)}
                          disabled={downloadingSlipId === p._id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition disabled:opacity-50"
                        >
                          {downloadingSlipId === p._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          PDF
                        </button>
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
        {payouts.length > 0 && (
          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE) || 1}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            loading={loading}
          />
        )}
      </section>
    </div>
  );
}


