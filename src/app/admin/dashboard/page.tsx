'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, DollarSign, Users, ClipboardList, Package } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';
import { getAdminDashboardStats, type AdminDashboardStats } from '@/services/adminDashboardApi';
import { ApiClientError } from '@/lib/apiClient';

export default function AdminDashboardPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      setError('Please log in to view the dashboard.');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminDashboardStats(accessToken);
        setStats(response.stats);
      } catch (err) {
        console.error('Failed to fetch admin dashboard stats:', err);
        if (err instanceof ApiClientError) {
          if (err.status === 401) setError('Please log in again.');
          else if (err.status === 403) setError('You do not have permission to view this dashboard.');
          else setError(err.message || 'Failed to load dashboard.');
        } else {
          setError('Failed to load dashboard. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <p className="font-semibold text-destructive">Error loading dashboard</p>
        <p className="text-sm text-muted mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-muted text-sm">No data available.</div>
    );
  }

  const topCards = [
    {
      title: 'Total Revenue',
      value: stats.revenue.formatted,
      change: `${stats.revenue.paidOrdersCount} paid orders`,
      icon: DollarSign,
    },
    {
      title: 'Active Vendors',
      value: String(stats.vendors.active),
      change: stats.vendors.pending > 0 ? `${stats.vendors.pending} pending approval` : 'All reviewed',
      icon: Users,
    },
    {
      title: 'Pending Approvals',
      value: String(stats.vendors.pending),
      change: 'Vendor applications awaiting review',
      icon: ClipboardList,
    },
    {
      title: 'Open Orders',
      value: String(stats.orders.open),
      change: stats.orders.paidPendingFulfilment > 0
        ? `${stats.orders.paidPendingFulfilment} paid, awaiting fulfilment`
        : 'Orders needing attention',
      icon: Package,
    },
  ];

  const pipelineMax = Math.max(
    stats.pipeline.submittedApplications,
    stats.pipeline.kycInReview,
    stats.pipeline.approvedVendors,
    1,
  );
  const pipelineItems = [
    { label: 'Submitted applications', value: stats.pipeline.submittedApplications, progress: stats.pipeline.submittedApplications / pipelineMax },
    { label: 'KYC in review', value: stats.pipeline.kycInReview, progress: stats.pipeline.kycInReview / pipelineMax },
    { label: 'Approved vendors', value: stats.pipeline.approvedVendors, progress: stats.pipeline.approvedVendors / pipelineMax },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">{card.title}</p>
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-2 text-xs font-medium text-muted">{card.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Vendor pipeline</h2>
              <p className="text-sm text-muted">Onboarding stages for vendor applications</p>
            </div>
            <Link
              href="/admin/vendors"
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Manage vendors
            </Link>
          </header>
          <div className="mt-6 space-y-5">
            {pipelineItems.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>{stage.label}</span>
                  <span className="text-muted">{stage.value}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/20">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, stage.progress * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Overview</h2>
              <p className="text-sm text-muted">Products, orders & support</p>
            </div>
          </header>
          <div className="mt-6 grid gap-5">
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Products</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {stats.products.active} active / {stats.products.total} total
              </p>
              <p className="text-xs text-muted">
                {stats.products.pendingApproval > 0
                  ? `${stats.products.pendingApproval} pending approval`
                  : 'All approved'}
                {stats.products.featured > 0 && ` · ${stats.products.featured} featured`}
              </p>
              <Link href="/admin/products" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                Manage products
              </Link>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Orders</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {stats.orders.total} total
              </p>
              <p className="text-xs text-muted">
                {stats.orders.open} open · {stats.orders.cancelled} cancelled
              </p>
              <Link href="/admin/orders" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                View orders
              </Link>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Support & reach</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {stats.support.unreadQueries} new queries · {stats.support.totalSubscribers} subscribers
              </p>
              <p className="text-xs text-muted">
                Contact form and newsletter signups
              </p>
              <div className="mt-2 flex gap-3">
                <Link href="/admin/queries" className="text-xs font-semibold text-primary hover:underline">
                  Queries
                </Link>
                <Link href="/admin/subscribers" className="text-xs font-semibold text-primary hover:underline">
                  Subscribers
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
