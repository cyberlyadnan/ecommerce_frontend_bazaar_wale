'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, RefreshCcw, Search, X } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { Pagination } from '@/components/shared/Pagination';
import { fetchProducts, ProductDto } from '@/services/catalogApi';
import { useAppSelector } from '@/store/redux/store';

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [page, setPage] = useState(1);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, scope]);

  const loadProducts = async (searchValue: string, scopeValue: 'all' | 'mine', pageNum: number) => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setProducts([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetchProducts(accessToken, {
        search: searchValue || undefined,
        scope: scopeValue,
        limit: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
      });
      setProducts(response.products);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to load products', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Unable to fetch products right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      setError('Admin session expired. Please sign in again.');
      setProducts([]);
      return;
    }
    loadProducts(debouncedSearch, scope, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, debouncedSearch, scope, page]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Product catalogue</h1>
          <p className="text-sm text-muted">
            Validate listing quality, pricing accuracy, and readiness for B2B buyers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <button
              type="button"
              className={`px-4 py-2 text-xs font-semibold transition ${
                scope === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
              onClick={() => setScope('all')}
            >
              All products
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-xs font-semibold transition ${
                scope === 'mine'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
              onClick={() => setScope('mine')}
            >
              My products
            </button>
          </div>
          <button
            onClick={() => loadProducts(debouncedSearch, scope, page)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
            type="button"
            disabled={loading || !accessToken}
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus size={16} />
            Create product
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            loadProducts(searchTerm.trim(), scope, 1);
          }}
        >
          <div className="w-full md:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product title, tags, vendor name, business name, or GST number"
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
              Searches product titles, descriptions, tags, vendor name, business name, and GST number.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !accessToken}
          >
            <Search size={16} />
            Search catalogue
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border/80 text-sm">
          <thead className="bg-muted/20 text-muted">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Product</th>
              <th className="px-5 py-3 text-left font-medium">Vendor</th>
              <th className="px-5 py-3 text-left font-medium">Category</th>
              <th className="px-5 py-3 text-left font-medium">Price</th>
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
                    Loading products…
                  </span>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-muted">
                  No products yet. Use “Create product” to add inventory.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-muted/10">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{product.title}</span>
                      <span className="text-xs text-muted">SKU • {product.sku ?? 'N/A'}</span>
                      {product.tags && product.tags.length > 0 && (
                        <span className="text-xs text-muted">Tags • {product.tags.join(', ')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {product.vendor ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {product.vendor.businessName || product.vendor.name || '—'}
                        </span>
                        {product.vendor.businessName && product.vendor.name && (
                          <span className="text-xs text-muted">{product.vendor.name}</span>
                        )}
                        {product.vendor.gstNumber && (
                          <span className="text-xs text-muted">GST • {product.vendor.gstNumber}</span>
                        )}
                        {currentUser && product.vendor._id === currentUser.id && (
                          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                            Your listing
                          </span>
                        )}
                      </div>
                    ) : (
                      'Vendor removed'
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {product.category ? product.category.name : '—'}
                    {product.subcategory ? ` / ${product.subcategory.name}` : ''}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground font-semibold">
                    ₹{product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted/20 text-muted'
                        }`}
                      >
                        {product.isActive ? 'Live' : 'Inactive'}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          product.approvedByAdmin
                            ? 'bg-primary/10 text-primary'
                            : 'bg-amber-400/10 text-amber-600'
                        }`}
                      >
                        {product.approvedByAdmin ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={Math.ceil(total / PAGE_SIZE) || 1}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={(p) => setPage(p)}
          loading={loading}
        />
      </div>
    </div>
  );
}


