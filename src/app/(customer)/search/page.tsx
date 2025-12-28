'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';

import { fetchPublicProducts, type ProductDto } from '@/services/catalogApi';
import ProductCard from '@/components/shared/ProductCard';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  const [results, setResults] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // debounce typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // keep URL in sync with debounced query (matches Header form: name="q")
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
    else params.delete('q');

    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // fetch
  useEffect(() => {
    const run = async () => {
      const q = debouncedQuery.trim();
      if (!q) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const resp = await fetchPublicProducts({ search: q, limit: 60 });
        setResults(resp.products || []);
      } catch (e) {
        console.error('Search failed:', e);
        setResults([]);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [debouncedQuery]);

  const heading = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return 'Search';
    return `Results for “${q}”`;
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Smart Search
                </div> */}
                <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {heading}
                </h1>
                <p className="text-foreground/60 mt-1 text-sm sm:text-base">
                  Find the right products fast — type to search with instant results.
                </p>
              </div>

              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Browse all products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Search input */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-lg opacity-40" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 z-10" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="relative w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-sm hover:shadow-md transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition z-10"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* States */}
        {!debouncedQuery.trim() ? (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Start typing to search</h2>
            <p className="text-foreground/60 mt-2 max-w-xl mx-auto">
              Search by product name, category, or keywords. Results update automatically as you type.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-foreground/70">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Searching…</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center">
            <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-foreground/60 mt-2">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center">
            <h2 className="text-xl font-bold text-foreground">No results found</h2>
            <p className="text-foreground/60 mt-2">
              Try a different keyword, or browse all products.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-sm text-foreground/60">
                Showing <span className="font-bold text-foreground">{results.length}</span> result
                {results.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((p) => (
                <ProductCard key={p._id} product={p as any} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


