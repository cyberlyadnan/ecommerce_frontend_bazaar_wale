'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save, Truck, ArrowLeft } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';
import { getAdminShippingConfig, updateAdminShippingConfig } from '@/services/shippingConfigApi';

export default function AdminShippingSettingsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isEnabled, setIsEnabled] = useState(true);
  const [flatRate, setFlatRate] = useState<number>(100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(5000);

  const isValid = useMemo(() => flatRate >= 0 && freeShippingThreshold >= 0, [flatRate, freeShippingThreshold]);

  useEffect(() => {
    const run = async () => {
      if (!accessToken) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getAdminShippingConfig(accessToken);
        setIsEnabled(Boolean(res.config.isEnabled));
        setFlatRate(Number(res.config.flatRate ?? 0));
        setFreeShippingThreshold(Number(res.config.freeShippingThreshold ?? 0));
      } catch (e) {
        console.error('Failed to load shipping config:', e);
        setError(e instanceof ApiClientError ? e.message : 'Failed to load shipping settings.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) return;
    if (!isValid) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await updateAdminShippingConfig(
        { isEnabled, flatRate: Number(flatRate), freeShippingThreshold: Number(freeShippingThreshold) },
        accessToken,
      );
      setSuccess(res.message || 'Saved.');
      setTimeout(() => setSuccess(null), 2500);
    } catch (e) {
      console.error('Failed to save shipping config:', e);
      setError(e instanceof ApiClientError ? e.message : 'Failed to save shipping settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <Link href="/admin/settings" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Shipping pricing</h1>
            <p className="text-sm text-muted">
              Configure a global shipping cost applied during checkout. Shipping is stored on each order for transparency.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading || !isValid}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </header>

      {(error || success) && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            error
              ? 'border-danger/20 bg-danger/10 text-danger'
              : 'border-success/20 bg-success/10 text-success'
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading shipping settings…
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Enable shipping charges</p>
                <p className="text-sm text-muted mt-1">
                  If disabled, shipping cost will be ₹0 for all orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled((v) => !v)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  isEnabled ? 'bg-primary' : 'bg-muted/40'
                }`}
                aria-pressed={isEnabled}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-foreground/60">
                  Flat shipping rate (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={flatRate}
                  onChange={(e) => setFlatRate(Number(e.target.value))}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                />
                <p className="mt-2 text-xs text-muted">Applied when order subtotal is below the free shipping threshold.</p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-foreground/60">
                  Free shipping threshold (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                />
                <p className="mt-2 text-xs text-muted">Shipping becomes ₹0 when subtotal is at or above this value.</p>
              </div>
            </div>

            {!isValid && (
              <p className="text-sm text-danger">Values must be 0 or greater.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


