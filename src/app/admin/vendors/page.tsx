'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  ShieldAlert,
  UserCog,
  X,
} from 'lucide-react';

import {
  approveVendorApi,
  fetchVendors,
  rejectVendorApi,
  VendorDto,
} from '@/services/catalogApi';
import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';

type VendorStatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'suspended';

interface ActionState {
  vendorId: string | null;
  loading: boolean;
  error: string;
  success: string;
}

export default function AdminVendorsPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [vendors, setVendors] = useState<VendorDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<VendorStatusFilter>('pending');
  const [actionState, setActionState] = useState<ActionState>({
    vendorId: null,
    loading: false,
    error: '',
    success: '',
  });
  const [rejectReason, setRejectReason] = useState('');
  const [docVendorId, setDocVendorId] = useState<string | null>(null);
  const [profileVendorId, setProfileVendorId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadVendors = async (searchValue: string, statusValue: VendorStatusFilter) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setVendors([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetchVendors(accessToken, {
        search: searchValue || undefined,
        status: statusValue,
      });
      setVendors(response.vendors);
    } catch (err) {
      console.error('Failed to load vendors', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to fetch vendors right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setVendors([]);
      return;
    }
    loadVendors(debouncedSearch, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, debouncedSearch, status]);

  const stats = useMemo(() => {
    const totals = {
      all: vendors.length,
      pending: vendors.filter((vendor) => vendor.vendorStatus === 'pending').length,
      active: vendors.filter((vendor) => vendor.vendorStatus === 'active').length,
      rejected: vendors.filter((vendor) => vendor.vendorStatus === 'rejected').length,
      suspended: vendors.filter((vendor) => vendor.vendorStatus === 'suspended').length,
    };
    return totals;
  }, [vendors]);

  const handleApprove = async (vendorId: string) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      return;
    }
    setActionState({ vendorId, loading: true, error: '', success: '' });
    try {
      await approveVendorApi(vendorId, accessToken);
      setActionState({
        vendorId,
        loading: false,
        error: '',
        success: 'Vendor approved successfully.',
      });
      await loadVendors(debouncedSearch, status);
    } catch (err) {
      console.error('Failed to approve vendor', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to approve vendor right now.';
      setActionState({ vendorId, loading: false, error: message, success: '' });
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      return;
    }
    setActionState({ vendorId, loading: true, error: '', success: '' });
    try {
      await rejectVendorApi(vendorId, { reason: rejectReason || undefined }, accessToken);
      setActionState({
        vendorId,
        loading: false,
        error: '',
        success: 'Vendor rejected successfully.',
      });
      setRejectReason('');
      await loadVendors(debouncedSearch, status);
    } catch (err) {
      console.error('Failed to reject vendor', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to reject vendor right now.';
      setActionState({ vendorId, loading: false, error: message, success: '' });
    }
  };

  const resolveStatusBadge = (vendorStatus: VendorDto['vendorStatus']) => {
    switch (vendorStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={14} />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
            <AlertTriangle size={14} />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
            <ShieldAlert size={14} />
            Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-500">
            <ShieldAlert size={14} />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const selectedVendor = actionState.vendorId
    ? vendors.find((vendor) => vendor._id === actionState.vendorId)
    : undefined;

  const selectedDocVendor = docVendorId ? vendors.find((v) => v._id === docVendorId) : undefined;
  const selectedProfileVendor = profileVendorId
    ? vendors.find((v) => v._id === profileVendorId)
    : undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Vendor management</h1>
          <p className="text-sm text-muted">
            Review onboarding requests, validate documents, and keep the supplier network compliant.
          </p>
        </div>
        <button
          onClick={() => loadVendors(debouncedSearch, status)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          type="button"
          disabled={loading || !accessToken}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted/80">All vendors</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stats.all}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted/80">Pending review</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted/80">Active vendors</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted/80">With issues</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {stats.rejected + stats.suspended}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm space-y-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            loadVendors(searchTerm.trim(), status);
          }}
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search vendors by business name, GST number, or contact"
                className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-muted">
              Searches vendor name, business name, GST number, email, and phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'pending', 'active', 'rejected', 'suspended'] as VendorStatusFilter[]).map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatus(filter)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    status === filter
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border text-muted hover:text-foreground'
                  }`}
                >
                  {filter === 'all'
                    ? 'All'
                    : filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase()}
                </button>
              ),
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !accessToken}
          >
            <Search size={16} />
            Search vendors
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/80 text-sm">
            <thead className="bg-muted/20 text-muted">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Business</th>
                <th className="px-5 py-3 text-left font-medium">Contact</th>
                <th className="px-5 py-3 text-left font-medium">Compliance</th>
                <th className="px-5 py-3 text-left font-medium">Created</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading vendors…
                    </span>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted">
                    No vendors found for the selected filters.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-muted/10">
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">
                          {vendor.businessName ?? '—'}
                        </span>
                        <span className="text-xs text-muted">Legal: {vendor.name}</span>
                        {vendor.businessName && (
                          <span className="text-xs text-muted">
                            {vendor.vendorStatus === 'pending'
                              ? 'Pending onboarding'
                              : 'Registered vendor'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      <div className="flex flex-col gap-1">
                        {vendor.email && <span>Email: {vendor.email}</span>}
                        {vendor.phone && <span>Phone: {vendor.phone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-2 text-foreground">
                          <Building2 size={14} />
                          {vendor.gstNumber ?? 'GST updating'}
                        </span>
                        <Link
                          href="#"
                          className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80"
                          onClick={(e) => {
                            e.preventDefault();
                            setDocVendorId(vendor._id);
                          }}
                        >
                          <FileText size={12} />
                          View documents
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">
                      <div className="flex flex-col">
                        <span>
                          Created:{' '}
                          {new Date(vendor.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>
                          Updated:{' '}
                          {new Date(vendor.updatedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{resolveStatusBadge(vendor.vendorStatus)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {vendor.vendorStatus === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(vendor._id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={actionState.loading}
                          >
                            {actionState.vendorId === vendor._id && actionState.loading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Approve
                          </button>
                        )}
                        {vendor.vendorStatus !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setActionState((prev) => ({ ...prev, vendorId: vendor._id }))}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition"
                          >
                            <ShieldAlert size={14} />
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setProfileVendorId(vendor._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                        >
                          <UserCog size={14} />
                          View profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {actionState.vendorId && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Reject vendor – {selectedVendor.businessName ?? selectedVendor.name}
                </h2>
                <p className="text-sm text-muted">
                  Provide an optional reason for rejection. The vendor will appear again once they update
                  their documents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionState({ vendorId: null, loading: false, error: '', success: '' })}
                className="rounded-full p-1 text-muted hover:text-foreground hover:bg-muted/20 transition"
                aria-label="Close reject dialog"
              >
                <X size={18} />
              </button>
            </div>

            <label className="text-xs font-semibold uppercase text-muted/80">
              Reason (optional)
            </label>
            <textarea
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              rows={4}
              placeholder="Documents out of date, missing compliance certificates, etc."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />

            {actionState.error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {actionState.error}
              </div>
            )}

            {actionState.success && (
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-600">
                {actionState.success}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionState({ vendorId: null, loading: false, error: '', success: '' })}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                disabled={actionState.loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleReject(selectedVendor._id)}
                disabled={actionState.loading}
              >
                {actionState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert size={16} />}
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {docVendorId && selectedDocVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Documents – {selectedDocVendor.businessName ?? selectedDocVendor.name}
                </h2>
                <p className="text-sm text-muted">
                  Review uploaded documents (Aadhaar, GST, PAN) before approving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDocVendorId(null)}
                className="rounded-full p-1 text-muted hover:text-foreground hover:bg-muted/20 transition"
                aria-label="Close documents dialog"
              >
                <X size={18} />
              </button>
            </div>

            {selectedDocVendor.verification?.documents?.length ? (
              <div className="space-y-3">
                {selectedDocVendor.verification.documents.map((doc, idx) => (
                  <div
                    key={(doc.type || 'doc') + idx}
                    className="rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted/80">
                      {doc.type || 'document'}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {doc.fileName || 'Uploaded file'}
                    </p>
                    {doc.accessUrl || doc.url ? (
                      <a
                        href={doc.accessUrl || doc.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-primary/80"
                        onClick={async (e) => {
                          // Security: Use secure API endpoint if available
                          if (doc.accessUrl && accessToken) {
                            e.preventDefault();
                            try {
                              // Fetch document via secure API with authentication
                              const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
                                ? (process.env.NEXT_PUBLIC_API_BASE_URL.startsWith('http') 
                                    ? process.env.NEXT_PUBLIC_API_BASE_URL 
                                    : `http://${process.env.NEXT_PUBLIC_API_BASE_URL}`)
                                : 'http://localhost:5000';
                              const secureUrl = `${apiBaseUrl}${doc.accessUrl}`;
                              
                              // Fetch with authentication header
                              const response = await fetch(secureUrl, {
                                headers: {
                                  'Authorization': `Bearer ${accessToken}`,
                                },
                                credentials: 'include',
                              });
                              
                              if (response.ok) {
                                // Create blob and open in new window
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                window.open(blobUrl, '_blank');
                                // Clean up blob URL after a delay
                                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                              } else {
                                alert('Failed to access document. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error accessing document:', error);
                              alert('Failed to access document. Please try again.');
                            }
                          }
                          // If no accessUrl, fallback to legacy URL (for backward compatibility)
                        }}
                      >
                        Open / Download
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-muted">No document available.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
                No documents found for this vendor.
              </div>
            )}
          </div>
        </div>
      )}

      {profileVendorId && selectedProfileVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Vendor profile – {selectedProfileVendor.businessName ?? selectedProfileVendor.name}
                </h2>
                <p className="text-sm text-muted">
                  Review vendor details and verification documents before approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileVendorId(null)}
                className="rounded-full p-1 text-muted hover:text-foreground hover:bg-muted/20 transition"
                aria-label="Close vendor profile dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted/80">Business</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {selectedProfileVendor.businessName ?? '—'}
                </p>
                <p className="mt-1 text-xs text-muted">Legal name: {selectedProfileVendor.name}</p>
                <div className="mt-4 space-y-1 text-sm text-muted">
                  <p>GST: <span className="font-medium text-foreground">{selectedProfileVendor.gstNumber ?? '—'}</span></p>
                  <p>PAN: <span className="font-medium text-foreground">{selectedProfileVendor.panNumber ?? '—'}</span></p>
                  <p>Aadhaar: <span className="font-medium text-foreground">{selectedProfileVendor.aadharNumber ?? '—'}</span></p>
                  <p>Status: <span className="font-medium text-foreground">{selectedProfileVendor.vendorStatus}</span></p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted/80">Contact</p>
                <div className="mt-2 space-y-1 text-sm text-muted">
                  <p>Email: <span className="font-medium text-foreground">{selectedProfileVendor.email ?? '—'}</span></p>
                  <p>Phone: <span className="font-medium text-foreground">{selectedProfileVendor.phone ?? '—'}</span></p>
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted">
                  <p>Created: {new Date(selectedProfileVendor.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedProfileVendor.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">Verification documents</p>
                <button
                  type="button"
                  onClick={() => {
                    setProfileVendorId(null);
                    setDocVendorId(selectedProfileVendor._id);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  <FileText size={14} />
                  Open documents
                </button>
              </div>
              <p className="mt-1 text-xs text-muted">
                {selectedProfileVendor.verification?.documents?.length
                  ? `${selectedProfileVendor.verification.documents.length} file(s) uploaded`
                  : 'No documents found'}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setProfileVendorId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
              >
                Close
              </button>
              {selectedProfileVendor.vendorStatus === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedProfileVendor._id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={actionState.loading}
                >
                  {actionState.loading && actionState.vendorId === selectedProfileVendor._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve vendor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

