'use client';

import { useEffect, useState } from 'react';
import { Mail, Loader2, Download } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { Pagination } from '@/components/shared/Pagination';
import { getSubscribers, SubscriberDto } from '@/services/subscriberApi';
import { useAppSelector } from '@/store/redux/store';

type StatusFilter = 'all' | 'active' | 'unsubscribed';

const PAGE_SIZE = 20;

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const loadSubscribers = async (status: StatusFilter, pageNum: number) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setSubscribers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await getSubscribers(accessToken, {
        status: status === 'all' ? undefined : status,
        limit: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      });
      setSubscribers(res.subscribers);
      setTotal(res.total);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Unable to fetch subscribers.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) loadSubscribers(statusFilter, page);
  }, [accessToken, statusFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleExport = () => {
    const csv = [
      'Email,Status,Subscribed At',
      ...subscribers.map(
        (s) =>
          `${s.email},${s.status},${new Date(s.createdAt).toLocaleString()}`,
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Newsletter Subscribers</h1>
          <p className="text-muted text-sm mt-1">
            Manage email subscriptions from the footer newsletter form
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <button
            onClick={handleExport}
            disabled={loading || subscribers.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Mail className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No subscribers yet</p>
            <p className="text-sm mt-1">Emails will appear here when users subscribe via the footer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <a
                        href={`mailto:${s.email}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {s.email}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.status === 'active'
                            ? 'bg-success/20 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-muted">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <Pagination
          page={page}
          totalPages={Math.ceil(total / PAGE_SIZE) || 1}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </div>
  );
}
