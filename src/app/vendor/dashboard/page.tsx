'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Package, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { getVendorDashboardStats, type VendorDashboardStats } from '@/services/vendorDashboardApi';
import { ApiClientError } from '@/lib/apiClient';

export default function VendorDashboardPage() {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('accessToken', accessToken);
    console.log('user', user);
    if (!accessToken) {
      setError('Please log in to view your dashboard.');
      setLoading(false);
      return;
    }

    if (user && user.role !== 'vendor') {
      setError('You do not have permission to access the vendor dashboard.');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getVendorDashboardStats(accessToken);
        setStats(response.stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        
        // Handle network errors
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Unable to connect to server. Please check your connection and try again.');
          return;
        }
        
        // Handle API errors
        if (err instanceof ApiClientError) {
          if (err.status === 401) {
            setError('Authentication required. Please log in again.');
          } else if (err.status === 403) {
            setError('You do not have permission to access this dashboard.');
          } else if (err.status === 404) {
            setError('Dashboard endpoint not found. Please contact support.');
          } else if (err.status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError(err.message || 'Failed to load dashboard data. Please try again.');
          }
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  const metrics = stats
    ? [
        {
          label: 'Net revenue',
          value: stats.revenue.formatted,
          change: 'From paid orders',
          icon: DollarSign,
        },
        {
          label: 'Active listings',
          value: stats.products.active.toString(),
          change:
            stats.products.pending > 0
              ? `${stats.products.pending} pending review`
              : 'All active',
          icon: Package,
        },
        {
          label: 'Open orders',
          value: stats.orders.open.toString(),
          change:
            stats.orders.requiringDispatch > 0
              ? `${stats.orders.requiringDispatch} require dispatch today`
              : 'All processed',
          icon: ShoppingCart,
        },
        {
          label: 'Fulfilment rate',
          value: `${stats.fulfilment.rate}%`,
          change: `${stats.orders.total} total orders`,
          icon: TrendingUp,
        },
      ]
    : [];

  const getProgressWidth = (count: number, total: number): string => {
    if (total === 0 || count === 0) return 'w-0';
    const percentage = count / total;
    if (percentage >= 0.75) return 'w-3/4';
    if (percentage >= 0.5) return 'w-2/4';
    if (percentage >= 0.25) return 'w-1/4';
    return 'w-1/4';
  };

  const fulfilment = stats
    ? [
        {
          label: 'Packed & ready',
          value: `${stats.fulfilment.packedReady} orders`,
          progress: getProgressWidth(stats.fulfilment.packedReady, stats.orders.total),
        },
        {
          label: 'Awaiting courier pickup',
          value: `${stats.fulfilment.awaitingPickup} orders`,
          progress: getProgressWidth(stats.fulfilment.awaitingPickup, stats.orders.total),
        },
        {
          label: 'Delayed dispatch',
          value: `${stats.fulfilment.delayedDispatch} orders`,
          progress: getProgressWidth(stats.fulfilment.delayedDispatch, stats.orders.total),
        },
      ]
    : [];

  const settlements = [
    { title: 'Next payout', amount: 'Coming soon', subtext: 'Payment system in development' },
    { title: 'Pending adjustments', amount: '₹0', subtext: 'No pending adjustments' },
    { title: 'Refund reserve', amount: '₹0', subtext: 'No refunds pending' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-semibold mb-1">Error loading dashboard</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                if (!accessToken) {
                  setError('Please log in to view your dashboard.');
                  return;
                }
                if (user && user.role !== 'vendor') {
                  setError('You do not have permission to access the vendor dashboard.');
                  return;
                }
                setError('');
                const fetchStats = async () => {
                  try {
                    setLoading(true);
                    const response = await getVendorDashboardStats(accessToken);
                    setStats(response.stats);
                    setError('');
                  } catch (err) {
                    console.error('Failed to fetch dashboard stats:', err);
                    
                    // Handle network errors
                    if (err instanceof TypeError && err.message.includes('fetch')) {
                      setError('Unable to connect to server. Please check your connection and try again.');
                      return;
                    }
                    
                    // Handle API errors
                    if (err instanceof ApiClientError) {
                      if (err.status === 401) {
                        setError('Authentication required. Please log in again.');
                      } else if (err.status === 403) {
                        setError('You do not have permission to access this dashboard.');
                      } else if (err.status === 404) {
                        setError('Dashboard endpoint not found. Please contact support.');
                      } else if (err.status >= 500) {
                        setError('Server error. Please try again later.');
                      } else {
                        setError(err.message || 'Failed to load dashboard data. Please try again.');
                      }
                    } else {
                      setError('Failed to load dashboard data. Please try again.');
                    }
                  } finally {
                    setLoading(false);
                  }
                };
                fetchStats();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="bg-muted/10 border border-border text-muted rounded-xl p-4 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted">
          Track performance, fulfil outstanding orders, and keep your catalogue healthy.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-muted/80">{metric.label}</p>
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{metric.value}</p>
              <p className="mt-2 text-xs font-medium text-muted">{metric.change}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Order fulfilment</h2>
              <p className="text-sm text-muted">Monitor the pipeline and keep SLAs on track.</p>
            </div>
            <Link
              href="/vendor/orders"
              className="text-xs font-semibold text-primary hover:text-primary/80"
            >
              View all orders
            </Link>
          </header>
          <div className="mt-6 space-y-5">
            {fulfilment.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>{stage.label}</span>
                  <span className="text-muted">{stage.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/30">
                  <div className={`h-full rounded-full bg-primary ${stage.progress}`} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Settlements</h2>
              <p className="text-sm text-muted">Upcoming payouts and financial health.</p>
            </div>
            <Link
              href="/vendor/payments"
              className="text-xs font-semibold text-primary hover:text-primary/80"
            >
              View statement
            </Link>
          </header>
          <div className="mt-6 grid gap-4">
            {settlements.map((item) => (
              <div key={item.title} className="rounded-xl border border-border/70 bg-background/70 px-4 py-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{item.amount}</p>
                <p className="text-xs text-muted">{item.subtext}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
