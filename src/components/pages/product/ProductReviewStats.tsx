'use client';

import { useEffect, useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { getProductReviews, type ProductReviewsResponse } from '@/services/reviewApi';

interface ProductReviewStatsProps {
  productId: string;
}

export function ProductReviewStats({ productId }: ProductReviewStatsProps) {
  const [stats, setStats] = useState<ProductReviewsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getProductReviews(productId, { limit: 1 });
        setStats(data.stats);
      } catch (err) {
        // Silently handle errors - stats are optional
        console.error('Failed to load review stats:', err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [productId]);

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

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!stats || stats.totalReviews === 0) {
    return null; // Don't show stats if there are no reviews
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Average Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {renderStars(stats.averageRating)}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-semibold text-foreground">
            {stats.averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-foreground/60">
            ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.ratingDistribution && Object.keys(stats.ratingDistribution).length > 0 && (
        <div className="flex items-center gap-3 text-sm">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star] || 0;
            if (count === 0) return null;
            return (
              <div key={star} className="flex items-center gap-1">
                <span className="text-foreground/70">{star}</span>
                <Star className="w-3 h-3 fill-secondary text-secondary" />
                <span className="text-foreground/60">({count})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

