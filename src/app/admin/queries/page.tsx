'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Reply, Trash2, Eye, CheckCircle2, X } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import {
  ContactQueryDto,
  deleteContactQuery,
  getContactQueries,
  updateContactQuery,
} from '@/services/contactApi';
import { useAppSelector } from '@/store/redux/store';

type StatusFilter = 'all' | 'new' | 'read' | 'replied' | 'closed';

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<ContactQueryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedQuery, setSelectedQuery] = useState<ContactQueryDto | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const loadQueries = async (status: StatusFilter) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setQueries([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getContactQueries(accessToken, {
        status: status === 'all' ? undefined : status,
        limit: 100,
      });
      setQueries(response.contacts);
    } catch (err) {
      console.error('Failed to load queries', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to fetch queries right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadQueries(statusFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, statusFilter]);

  const handleMarkAsRead = async (queryId: string) => {
    if (!accessToken) return;

    try {
      await updateContactQuery(queryId, { status: 'read' }, accessToken);
      await loadQueries(statusFilter);
    } catch (err) {
      console.error('Failed to update query status', err);
    }
  };

  const handleRespond = async (query: ContactQueryDto) => {
    if (!accessToken || !responseText.trim()) {
      return;
    }

    setResponding(true);
    setError('');

    try {
      await updateContactQuery(
        query._id,
        {
          status: 'replied',
          adminResponse: responseText.trim(),
        },
        accessToken,
      );
      setSelectedQuery(null);
      setResponseText('');
      await loadQueries(statusFilter);
    } catch (err) {
      console.error('Failed to respond to query', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to send response. Please try again.';
      setError(message);
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this query? This action cannot be undone.')) {
      return;
    }

    if (!accessToken) return;

    setDeletingId(queryId);
    setError('');

    try {
      await deleteContactQuery(queryId, accessToken);
      await loadQueries(statusFilter);
    } catch (err) {
      console.error('Failed to delete query', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to delete query. Please try again.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: ContactQueryDto['status']) => {
    const styles = {
      new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      read: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      replied: 'bg-success/10 text-success border-success/20',
      closed: 'bg-muted/20 text-muted border-border',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const unreadCount = queries.filter((q) => q.status === 'new').length;

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Contact Queries</h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Manage customer inquiries and respond to contact form submissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            {(['all', 'new', 'read', 'replied', 'closed'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                className={`px-3 md:px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted hover:text-foreground'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'new' && unreadCount > 0 && (
                  <span className="ml-1 bg-primary-foreground/20 text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading queries…
            </span>
          </div>
        ) : queries.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <MessageSquare className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No queries found.</p>
          </div>
        ) : (
          queries.map((query) => (
            <div
              key={query._id}
              className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{query.subject}</h3>
                  <p className="text-xs text-muted mt-1">{query.name}</p>
                  <p className="text-xs text-muted">{query.email}</p>
                </div>
                {getStatusBadge(query.status)}
              </div>

              <p className="text-sm text-foreground/70 line-clamp-2">{query.message}</p>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedQuery(query)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                >
                  <Eye size={14} />
                  View
                </button>
                {query.status === 'new' && (
                  <button
                    onClick={() => handleMarkAsRead(query._id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                  >
                    <CheckCircle2 size={14} />
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(query._id)}
                  disabled={deletingId === query._id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                >
                  {deletingId === query._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/80 text-sm">
            <thead className="bg-muted/20 text-muted">
              <tr>
                <th className="px-5 py-3 text-left font-medium">From</th>
                <th className="px-5 py-3 text-left font-medium">Subject</th>
                <th className="px-5 py-3 text-left font-medium">Message</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading queries…
                    </span>
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="w-12 h-12 text-muted/50" />
                      <p>No queries found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queries.map((query) => (
                  <tr
                    key={query._id}
                    className={`hover:bg-muted/10 ${query.status === 'new' ? 'bg-blue-500/5' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{query.name}</span>
                        <span className="text-xs text-muted">{query.email}</span>
                        {query.phone && <span className="text-xs text-muted">{query.phone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-foreground">{query.subject}</span>
                    </td>
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-sm text-foreground/70 line-clamp-2">{query.message}</p>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(query.status)}</td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedQuery(query)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        {query.status === 'new' && (
                          <button
                            onClick={() => handleMarkAsRead(query._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                          >
                            <CheckCircle2 size={14} />
                            Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(query._id)}
                          disabled={deletingId === query._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                        >
                          {deletingId === query._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedQuery.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>{selectedQuery.name}</span>
                    <span>•</span>
                    <a href={`mailto:${selectedQuery.email}`} className="hover:text-primary">
                      {selectedQuery.email}
                    </a>
                    {selectedQuery.phone && (
                      <>
                        <span>•</span>
                        <a href={`tel:${selectedQuery.phone}`} className="hover:text-primary">
                          {selectedQuery.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedQuery(null);
                    setResponseText('');
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Message</h3>
                  <div className="bg-muted/20 rounded-lg p-4 text-sm text-foreground/70 whitespace-pre-wrap">
                    {selectedQuery.message}
                  </div>
                </div>

                {selectedQuery.adminResponse && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Admin Response</h3>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-sm text-foreground/70 whitespace-pre-wrap">
                      {selectedQuery.adminResponse}
                    </div>
                    {selectedQuery.respondedBy && (
                      <p className="text-xs text-muted mt-2">
                        Responded by {selectedQuery.respondedBy.name} on{' '}
                        {selectedQuery.respondedAt
                          ? new Date(selectedQuery.respondedAt).toLocaleString()
                          : ''}
                      </p>
                    )}
                  </div>
                )}

                {!selectedQuery.adminResponse && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Send Response</h3>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Type your response here..."
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleRespond(selectedQuery)}
                        disabled={responding || !responseText.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {responding ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Reply size={16} />
                            Send Response
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuery(null);
                          setResponseText('');
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

