'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Eye,
  Users,
  Repeat,
  Package,
  TrendingUp,
  FileText,
  BarChart3,
  DollarSign,
  ExternalLink,
} from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import {
  getAnalyticsOverview,
  getTopViewedProducts,
  getProductViewCounts,
  getVisitsOverTime,
  getTopPages,
  getSalesInsights,
  getRevenueOverTime,
  type AnalyticsOverview as OverviewType,
  type TopProductView,
  type ProductViewCountRow,
  type VisitsByDay,
  type TopPageRow,
  type SalesInsight,
  type RevenueByDay,
} from '@/services/analyticsApi';
import { ApiClientError } from '@/lib/apiClient';

const PERIOD_OPTIONS = [7, 30, 90] as const;

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function AdminAnalyticsPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductView[]>([]);
  const [productViewCounts, setProductViewCounts] = useState<ProductViewCountRow[]>([]);
  const [visitsOverTime, setVisitsOverTime] = useState<VisitsByDay[]>([]);
  const [topPages, setTopPages] = useState<TopPageRow[]>([]);
  const [salesInsights, setSalesInsights] = useState<SalesInsight[]>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<RevenueByDay[]>([]);

  useEffect(() => {
    if (!accessToken) {
      setError('Please log in to view analytics.');
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');
        const [overviewRes, topProductsRes, viewCountsRes, visitsRes, pagesRes, insightsRes, revenueRes] = await Promise.all([
          getAnalyticsOverview(accessToken, periodDays),
          getTopViewedProducts(accessToken, 15, periodDays),
          getProductViewCounts(accessToken, 30),
          getVisitsOverTime(accessToken, periodDays),
          getTopPages(accessToken, 15, periodDays),
          getSalesInsights(accessToken, 20),
          getRevenueOverTime(accessToken, periodDays),
        ]);
        setOverview(overviewRes);
        setTopProducts(topProductsRes.products ?? []);
        setProductViewCounts(viewCountsRes.products ?? []);
        setVisitsOverTime(visitsRes.data ?? []);
        setTopPages(pagesRes.pages ?? []);
        setSalesInsights(insightsRes.insights ?? []);
        setRevenueOverTime(revenueRes.data ?? []);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        if (err instanceof ApiClientError) {
          if (err.status === 401) setError('Please log in again.');
          else if (err.status === 403) setError('You do not have permission to view analytics.');
          else setError(err.message || 'Failed to load analytics.');
        } else {
          setError('Failed to load analytics. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [accessToken, periodDays]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Error loading analytics</p>
        <p className="text-sm text-muted mt-1">{error}</p>
      </div>
    );
  }

  const maxPageViews = Math.max(1, ...visitsOverTime.map((d) => d.pageViews));
  const maxRevenue = Math.max(1, ...revenueOverTime.map((d) => d.revenue));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted mt-1">Website visits, product views, and sales insights</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Period:</span>
          <select
            value={periodDays}
            onChange={(e) => setPeriodDays(Number(e.target.value))}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PERIOD_OPTIONS.map((d) => (
              <option key={d} value={d}>
                Last {d} days
              </option>
            ))}
          </select>
        </div>
      </div>

      {overview && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Page views</p>
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Eye size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{formatNumber(overview.totalPageViews)}</p>
            <p className="mt-2 text-xs font-medium text-muted">Total in selected period</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Unique visitors</p>
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Users size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{formatNumber(overview.uniqueVisitors)}</p>
            <p className="mt-2 text-xs font-medium text-muted">Distinct visitors</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Returning visitors</p>
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Repeat size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{formatNumber(overview.returningVisitors)}</p>
            <p className="mt-2 text-xs font-medium text-muted">Visited on multiple days</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Product views</p>
              <span className="rounded-full bg-primary/10 p-2 text-primary">
                <Package size={16} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-foreground">{formatNumber(overview.totalProductViews)}</p>
            <p className="mt-2 text-xs font-medium text-muted">Product detail page views</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Visits over time</h2>
          </header>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {visitsOverTime.length === 0 ? (
              <p className="text-sm text-muted">No visit data for this period.</p>
            ) : (
              visitsOverTime.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-muted shrink-0">{d.date}</span>
                  <div className="flex-1 flex gap-1 items-center">
                    <div
                      className="h-6 rounded bg-primary/20 min-w-[2px]"
                      style={{ width: `${(d.pageViews / maxPageViews) * 100}%` }}
                      title={`${d.pageViews} page views`}
                    />
                    <span className="text-xs text-muted w-12">{d.pageViews}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center gap-2 mb-6">
            <DollarSign size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Revenue over time</h2>
          </header>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {revenueOverTime.length === 0 ? (
              <p className="text-sm text-muted">No revenue data for this period.</p>
            ) : (
              revenueOverTime.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-medium text-muted shrink-0">{d.date}</span>
                  <div className="flex-1 flex gap-2 items-center">
                    <div
                      className="h-6 rounded bg-success/30 min-w-[2px]"
                      style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                      title={`${formatCurrency(d.revenue)}`}
                    />
                    <span className="text-xs text-muted">{formatCurrency(d.revenue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Most viewed products (period)</h2>
          </div>
          <Link
            href="/admin/products"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            Manage products
          </Link>
        </header>
        <div className="overflow-x-auto">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted">No product view data for this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Product</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Views</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Sold</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-border/60 hover:bg-muted/10">
                    <td className="py-3 px-2">
                      <span className="font-medium text-foreground">{p.title}</span>
                    </td>
                    <td className="py-3 px-2 text-right text-muted">{formatNumber(p.viewCount)}</td>
                    <td className="py-3 px-2 text-right text-muted">{p.totalSold ?? 0}</td>
                    <td className="py-3 px-2">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <header className="flex items-center gap-2 mb-6">
          <Package size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Product view counts (all time)</h2>
        </header>
        <p className="text-sm text-muted mb-4">Cumulative view count per product from product detail page.</p>
        <div className="overflow-x-auto">
          {productViewCounts.length === 0 ? (
            <p className="text-sm text-muted">No product view counts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-foreground">Product</th>
                  <th className="text-right py-3 px-2 font-semibold text-foreground">Total views</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {productViewCounts.map((p) => (
                  <tr key={p.productId} className="border-b border-border/60 hover:bg-muted/10">
                    <td className="py-3 px-2 font-medium text-foreground">{p.title}</td>
                    <td className="py-3 px-2 text-right text-muted">{formatNumber(p.viewCount)}</td>
                    <td className="py-3 px-2">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center gap-2 mb-6">
            <FileText size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Top pages</h2>
          </header>
          <div className="space-y-2">
            {topPages.length === 0 ? (
              <p className="text-sm text-muted">No page view data.</p>
            ) : (
              topPages.map((p) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/10 border border-border/60"
                >
                  <span className="text-sm font-medium text-foreground truncate" title={p.path}>
                    {p.path || '/'}
                  </span>
                  <span className="text-sm text-muted shrink-0 ml-2">{formatNumber(p.views)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Sales insights</h2>
          </header>
          <p className="text-sm text-muted mb-4">View-to-sale conversion (products with views).</p>
          <div className="overflow-x-auto">
            {salesInsights.length === 0 ? (
              <p className="text-sm text-muted">No insights yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-foreground">Product</th>
                    <th className="text-right py-2 px-2 font-semibold text-foreground">Views</th>
                    <th className="text-right py-2 px-2 font-semibold text-foreground">Sold</th>
                    <th className="text-right py-2 px-2 font-semibold text-foreground">Conv.%</th>
                  </tr>
                </thead>
                <tbody>
                  {salesInsights.slice(0, 10).map((s) => (
                    <tr key={s.productId} className="border-b border-border/60">
                      <td className="py-2 px-2 font-medium text-foreground truncate max-w-[180px]">{s.title}</td>
                      <td className="py-2 px-2 text-right text-muted">{formatNumber(s.viewCount)}</td>
                      <td className="py-2 px-2 text-right text-muted">{s.totalSold}</td>
                      <td className="py-2 px-2 text-right text-muted">{s.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
