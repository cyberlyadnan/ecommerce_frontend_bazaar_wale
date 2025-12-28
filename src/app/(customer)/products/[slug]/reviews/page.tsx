'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, StarHalf, Loader2, AlertCircle } from 'lucide-react';
import { fetchProductBySlug, type ProductDto } from '@/services/catalogApi';
import { getProductReviews, type ReviewDto, type ProductReviewsResponse } from '@/services/reviewApi';
import { ReviewSection } from '@/components/pages/product/ReviewSection';
import { formatCurrency } from '@/utils/currency';

export default function ProductReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [stats, setStats] = useState<ProductReviewsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load product
        const response = await fetchProductBySlug(slug);
        const productData = response.product;
        if (!productData) {
          setError('Product not found');
          return;
        }
        setProduct(productData);

        // Load reviews
        const reviewsData = await getProductReviews(productData._id, { 
          page: 1, 
          limit: 20,
          sortBy: 'createdAt'
        });
        setReviews(reviewsData.reviews);
        setStats(reviewsData.stats);
        setHasMore(reviewsData.pagination.page < reviewsData.pagination.pages);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug]);

  const loadMoreReviews = async () => {
    if (!product || !hasMore || loading) return;

    try {
      setLoading(true);
      const reviewsData = await getProductReviews(product._id, { 
        page: page + 1, 
        limit: 20,
        sortBy: 'createdAt'
      });
      setReviews((prev) => [...prev, ...reviewsData.reviews]);
      setHasMore(reviewsData.pagination.page < reviewsData.pagination.pages);
      setPage((prev) => prev + 1);
    } catch (err: any) {
      console.error('Failed to load more reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf key={i} className="w-4 h-4 fill-secondary text-secondary" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-foreground/20" />
        );
      }
    }
    return stars;
  };

  if (loading && !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Error</h2>
          <p className="text-foreground/60 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/products/${product.slug}`}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{product.title}</h1>
              <p className="text-sm text-foreground/60">All Customer Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Product Summary */}
              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  {product.images?.[0] && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted/30">
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {product.title}
                    </Link>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/products/${product.slug}`}
                  className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
                >
                  View Product
                </Link>
              </div>

              {/* Overall Rating */}
              {stats && stats.totalReviews > 0 && (
                <div className="bg-surface rounded-xl p-6 border border-border shadow-sm">
                  <div className="text-center mb-6 pb-6 border-b border-border">
                    <div className="text-5xl font-bold text-foreground mb-3">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {renderStars(stats.averageRating)}
                    </div>
                    <p className="text-sm text-foreground/60">
                      Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>

                  {/* Rating Distribution - Compact */}
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Rating Breakdown</h4>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = stats.ratingDistribution[star] || 0;
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-xs font-medium text-foreground/80">{star}</span>
                            <Star className="w-3 h-3 fill-secondary text-secondary" />
                          </div>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground/60 w-8 text-right font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Reviews */}
          <div className="lg:col-span-2">
            <ReviewSection 
              productId={product._id} 
              productSlug={product.slug}
              showAll={true}
            />

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreReviews}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Reviews</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

