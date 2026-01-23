'use client';

import { useEffect, useMemo, useState } from 'react';

import { FileText, Loader2, Lock, Mail, Phone, Save, ShieldCheck } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { getVendorProfile, updateVendorProfile, VendorDocumentDto } from '@/services/vendorProfileApi';
import { useAppSelector } from '@/store/redux/store';

export default function VendorSettingsPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [vendor, setVendor] = useState<{
    name: string;
    email?: string;
    phone?: string;
    businessName?: string;
    gstNumber?: string;
    aadharNumber?: string;
    panNumber?: string;
    vendorStatus?: string;
  } | null>(null);

  const [verification, setVerification] = useState<{
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    documents: VendorDocumentDto[];
  } | null>(null);

  const [name, setName] = useState('');

  const docsByType = useMemo(() => {
    const docs = verification?.documents || [];
    const map = new Map<string, VendorDocumentDto>();
    for (const d of docs) {
      if (!d?.type) continue;
      map.set(d.type, d);
    }
    return map;
  }, [verification?.documents]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        if (!accessToken) throw new ApiClientError(401, 'Login required');
        const res = await getVendorProfile(accessToken);
        if (!mounted) return;
        setVendor(res.vendor);
        setVerification(res.verification);
        setName(res.vendor.name || '');
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load vendor settings');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const readOnlyField = (label: string, value?: string) => (
    <div className="space-y-2 text-sm">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted/80">
        <Lock className="h-3.5 w-3.5" />
        {label}
      </span>
      <div className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground">
        {value || '—'}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Business settings</h1>
        <p className="text-sm text-muted">
          View your verification documents and keep your basic profile details updated.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          <p className="text-sm text-muted">
            Only your <span className="font-semibold text-foreground">name</span> is editable here. Other details are locked for compliance.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-background p-10 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings…
            </span>
          </div>
        ) : (
          <form
            className="grid gap-5 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setSuccess('');
              try {
                if (!accessToken) throw new ApiClientError(401, 'Login required');
                setSaving(true);
                const res = await updateVendorProfile(accessToken, { name });
                setVendor((prev) => (prev ? { ...prev, name: res.vendor.name } : prev));
                setSuccess('Saved successfully.');
              } catch (err) {
                const msg =
                  err instanceof ApiClientError
                    ? err.message
                    : err instanceof Error
                      ? err.message
                      : 'Failed to save changes';
                setError(msg);
              } finally {
                setSaving(false);
              }
            }}
          >
            <label className="space-y-2 text-sm">
              <span className="text-xs font-semibold uppercase text-muted/80">Name (editable)</span>
              <input
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            {readOnlyField('Business name', vendor?.businessName)}
            {readOnlyField('GST number', vendor?.gstNumber)}
            {readOnlyField('Aadhaar number', vendor?.aadharNumber)}
            {readOnlyField('PAN number', vendor?.panNumber)}

            <div className="space-y-2 text-sm">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted/80">
                <Mail size={12} />
                Email (locked)
              </span>
              <div className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground">
                {vendor?.email || '—'}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted/80">
                <Phone size={12} />
                Phone (locked)
              </span>
              <div className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground">
                {vendor?.phone || '—'}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Verification status: <span className="capitalize">{verification?.status || 'pending'}</span>
                </p>
                {verification?.adminNotes && (
                  <p className="text-xs text-muted">Admin note: {verification.adminNotes}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-foreground">Your documents</h2>
          <p className="text-sm text-muted">
            These are uploaded during registration and cannot be edited from the vendor panel.
          </p>
        </header>

        {loading ? (
          <div className="text-sm text-muted">Loading documents…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { key: 'aadhaarFront', label: 'Aadhaar (Front)' },
              { key: 'aadhaarBack', label: 'Aadhaar (Back)' },
              { key: 'gstCertificate', label: 'GST Certificate' },
              { key: 'panCard', label: 'PAN Card' },
            ].map(({ key, label }) => {
              const doc = docsByType.get(key);
              const hasDocument = doc && (doc.accessUrl || doc.legacyUrl || doc.url);
              return (
                <div key={key} className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-1 text-xs text-muted break-all">{doc?.fileName || 'Not available'}</p>
                  <div className="mt-3">
                    {hasDocument ? (
                      <a
                        href={doc.accessUrl || doc.legacyUrl || doc.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/60 hover:text-primary transition"
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
                        <FileText size={14} />
                        View
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
                        <Lock className="h-3.5 w-3.5" />
                        Missing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}


