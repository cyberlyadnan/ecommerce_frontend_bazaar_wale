'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { fetchPublicProducts, ProductDto } from '@/services/catalogApi';
import { getFavoriteIds } from '@/utils/favorites';
import ProductCard from '@/components/shared/ProductCard';
import { ApiClientError } from '@/lib/apiClient';

export default function FavoritesPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      setError('');

      try {
        // Get favorite product IDs from localStorage
        const favoriteIds = getFavoriteIds();

        if (favoriteIds.length === 0) {
          setFavoriteProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all public products (or we could fetch by IDs if API supports it)
        // For now, fetch all and filter
        const response = await fetchPublicProducts({ limit: 200 });
        
        // Filter to only include favorite products
        const favorites = response.products.filter((product) =>
          favoriteIds.includes(product._id)
        );

        setFavoriteProducts(favorites);
      } catch (err) {
        console.error('Failed to load favorites', err);
        const message =
          err instanceof ApiClientError
            ? err.message
            : 'Unable to load favorites right now.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for storage changes to update when favorites are modified in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'b2b_favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleFavoriteChange = () => {
      loadFavorites();
    };

    window.addEventListener('favorites-changed', handleFavoriteChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-changed', handleFavoriteChange);
    };
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="text-muted mt-2">Products you've saved for later</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted">Loading favorites...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-6 text-center">
            <p>{error}</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No favorites yet</h3>
            <p className="text-muted mb-6">Start adding products to your favorites</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

