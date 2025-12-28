'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BarChart3, Pencil, Plus, RefreshCcw } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { useAppSelector } from '@/store/redux/store';
import { BlogDto, adminFetchBlogs, adminFetchBlogStats, BlogStatsDto } from '@/services/blogApi';

export default function AdminBlogsPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [stats, setStats] = useState<BlogStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const [list, stat] = await Promise.all([
        adminFetchBlogs(accessToken, { status, search, page: 1, limit: 30 }),
        adminFetchBlogStats(accessToken),
      ]);
      setBlogs(list.items);
      setStats(stat.stats);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, status]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blogs</h1>
          <p className="text-sm text-muted">Create, optimize, publish, and track performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus size={16} />
            New blog
          </Link>
        </div>
      </header>

      {stats && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase text-muted/80">Total posts</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase text-muted/80">Published</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{stats.published}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase text-muted/80">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{stats.drafts}</p>
          </div>
        </section>
      )}

      <section className="card p-5 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted/80">Status</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted/80">Search</p>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 max-w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Title, slug, tags…"
                />
                <button
                  type="button"
                  onClick={load}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {stats?.topByViews?.length ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted">
              <BarChart3 size={14} />
              Top views: {stats.topByViews[0]?.views ?? 0}
            </div>
          ) : null}
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-muted">No blogs found.</p>
        ) : (
          <div className="grid gap-3">
            {blogs.map((b) => (
              <div
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/40 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted">
                    /blog/{b.slug} · {b.status.toUpperCase()} · {b.views} views
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/blogs/${b._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


