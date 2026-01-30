'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, Loader2, Pencil, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';

import { ApiClientError } from '@/lib/apiClient';
import { Pagination } from '@/components/shared/Pagination';
import { deleteProductApi, fetchProducts, ProductDto } from '@/services/catalogApi';
import { useAppSelector } from '@/store/redux/store';

const PAGE_SIZE = 20;

export default function VendorProductsPage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadProducts = async (searchValue: string, pageNum: number) => {
    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      setProducts([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetchProducts(accessToken, {
        search: searchValue || undefined,
        scope: 'mine',
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
      setError('Session expired. Please sign in again.');
      setProducts([]);
      return;
    }
    loadProducts(debouncedSearch, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, debouncedSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    if (!accessToken) {
      setError('Session expired. Please sign in again.');
      return;
    }

    setDeletingId(productId);
    setError('');

    try {
      await deleteProductApi(productId, accessToken);
      // Reload products after deletion
      await loadProducts(debouncedSearch, page);
    } catch (err) {
      console.error('Failed to delete product', err);
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to delete product. Please try again.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">My Products</h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Manage your product listings and inventory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadProducts(debouncedSearch, page)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
            type="button"
            disabled={loading || !accessToken}
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create Product</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </header>

      <section className="rounded-xl md:rounded-2xl border border-border bg-surface p-3 md:p-4 shadow-sm">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            loadProducts(searchTerm.trim(), 1);
          }}
        >
          <div className="w-full md:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by product title, tags, or SKU"
                className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2 md:py-2.5 text-sm focus:border-primary focus:outline-none"
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
              Search your product titles, descriptions, tags, and SKU numbers.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !accessToken}
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
            <span className="sm:hidden">Go</span>
          </button>
        </form>
      </section>

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
              Loading products…
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted">No products yet. Create your first product to get started.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{product.title}</h3>
                  <p className="text-xs text-muted mt-1">SKU: {product.sku || 'N/A'}</p>
                  {product.tags && product.tags.length > 0 && (
                    <p className="text-xs text-muted mt-1">Tags: {product.tags.slice(0, 2).join(', ')}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${
                      product.isActive
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted/20 text-muted'
                    }`}
                  >
                    {product.isActive ? 'Public' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted">Price</p>
                  <p className="text-sm font-semibold text-foreground">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Stock</p>
                  <p className="text-sm font-semibold text-foreground">{product.stock || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Link
                  href={`/vendor/products/${product._id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                >
                  <Eye size={14} />
                  View
                </Link>
                <Link
                  href={`/vendor/products/${product._id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                >
                  <Pencil size={14} />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id)}
                  disabled={deletingId === product._id}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                >
                  {deletingId === product._id ? (
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
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Price</th>
                <th className="px-5 py-3 text-left font-medium">Stock</th>
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
                    No products yet. Use "Create product" to add inventory.
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
                      {product.category ? product.category.name : '—'}
                      {product.subcategory ? ` / ${product.subcategory.name}` : ''}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">{product.stock || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            product.isActive
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-muted/20 text-muted'
                          }`}
                        >
                          {product.isActive ? 'Public' : 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vendor/products/${product._id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        <Link
                          href={`/vendor/products/${product._id}/edit`}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
                        >
                          {deletingId === product._id ? (
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
        <Pagination
          page={page}
          totalPages={Math.ceil(total / PAGE_SIZE) || 1}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
}
