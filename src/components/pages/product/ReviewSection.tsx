'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Star,
  StarHalf,
  X,
  Upload,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAppSelector } from '@/store/redux/store';
import {
  getProductReviews,
  getUserReview,
  createReview,
  updateReview,
  deleteReview,
  uploadReviewImage,
  type ReviewDto,
  type ProductReviewsResponse,
} from '@/services/reviewApi';

interface ReviewSectionProps {
  productId: string;
  productSlug?: string;
  showAll?: boolean;
}

export function ReviewSection({ productId, productSlug, showAll = false }: ReviewSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [stats, setStats] = useState<ProductReviewsResponse['stats'] | null>(null);
  const [userReview, setUserReview] = useState<ReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<Array<{ url: string; alt?: string }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadReviews();
    if (user && accessToken) {
      loadUserReview();
    }
  }, [productId, user, accessToken]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const limit = showAll ? 50 : 3; // Show 3 reviews on product page, 50 on reviews page
      const data = await getProductReviews(productId, { limit });
      setReviews(data.reviews || []);
      setStats(data.stats || {
        averageRating: 0,
        totalReviews: 0,  
        ratingDistribution: {},
      });
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
      // Handle network errors (connection refused, etc.) gracefully
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - backend might not be running, show empty state
        setError(null);
        setReviews([]);
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        });
      } else if (err?.status && err.status >= 400) {
        // API error (4xx, 5xx) - show error message
        setError('Failed to load reviews. Please try again later.');
        setReviews([]);
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        });
      } else {
        // Other errors - show empty state
        setError(null);
        setReviews([]);
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {},
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserReview = async () => {
    if (!accessToken) return;
    try {
      const data = await getUserReview(productId, accessToken);
      setUserReview(data.review);
      if (data.review) {
        setRating(data.review.rating);
        setTitle(data.review.title || '');
        setComment(data.review.comment || '');
        setImages(data.review.images || []);
      }
    } catch (err: any) {
      // Silently handle errors for user review - network errors are expected if backend is down
      // Only log non-network errors
      if (!(err instanceof TypeError && err.message.includes('fetch'))) {
        console.error('Failed to load user review:', err);
      }
      // Don't set error state for user review - it's optional
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !accessToken) {
      if (!accessToken) {
        setError('Please login to upload images');
      }
      return;
    }

    // Check file count limit
    const remainingSlots = 5 - images.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`);
      e.target.value = '';
      return;
    }

    // Check file size (5MB limit)
    const oversizedFiles = Array.from(files).filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some images are too large. Maximum size is 5MB per image.');
      e.target.value = '';
      return;
    }

    setUploadingImages(true);
    setError(null);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadReviewImage(file, accessToken));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map((result) => ({
        url: result.file.url,
        alt: result.file.originalName,
      }));
      setImages((prev) => [...prev, ...newImages]);
    } catch (err: any) {
      console.error('Failed to upload images:', err);
      const errorMessage = err?.message || 'Failed to upload images. Please try again.';
      setError(errorMessage);
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setError('Please login to submit a review');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingReview && userReview) {
        await updateReview(
          userReview._id,
          {
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined,
            images,
          },
          accessToken,
        );
      } else {
        await createReview(
          {
            productId,
            rating,
            title: title.trim() || undefined,
            comment: comment.trim() || undefined,
            images,
          },
          accessToken,
        );
      }

      // Reset form
      setTitle('');
      setComment('');
      setImages([]);
      setRating(5);
      setShowReviewForm(false);
      setEditingReview(false);

      // Reload reviews
      await loadReviews();
      await loadUserReview();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (userReview) {
      setRating(userReview.rating);
      setTitle(userReview.title || '');
      setComment(userReview.comment || '');
      setImages(userReview.images || []);
      setEditingReview(true);
      setShowReviewForm(true);
    }
  };

  const handleDelete = async () => {
    if (!userReview || !accessToken) return;

    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      await deleteReview(userReview._id, accessToken);
      setUserReview(null);
      setTitle('');
      setComment('');
      setImages([]);
      setRating(5);
      await loadReviews();
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      setError(err.message || 'Failed to delete review');
    }
  };

  const handleCancel = () => {
    setShowReviewForm(false);
    setEditingReview(false);
    if (userReview) {
      setRating(userReview.rating);
      setTitle(userReview.title || '');
      setComment(userReview.comment || '');
      setImages(userReview.images || []);
    } else {
      setRating(5);
      setTitle('');
      setComment('');
      setImages([]);
    }
    setError(null);
  };

  const handleWriteReview = () => {
    // If user is not logged in, redirect to login page with return URL
    if (!user || !accessToken) {
      const returnUrl = encodeURIComponent(pathname + '#reviews');
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }
    // If user is logged in, show the review form
    setShowReviewForm(true);
  };

  const renderStars = (ratingValue: number, interactive = false, size = 'w-5 h-5') => {
    const stars = [];
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${size} fill-secondary text-secondary ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onClick={interactive ? () => setRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className={`${size} fill-secondary text-secondary ${
              interactive ? 'cursor-pointer' : ''
            }`}
            onClick={interactive ? () => setRating(i - 0.5) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          />,
        );
      } else {
        stars.push(
          <Star
            key={i}
            className={`${size} text-foreground/20 ${
              interactive ? 'cursor-pointer hover:text-secondary/50' : ''
            }`}
            onClick={interactive ? () => setRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          />,
        );
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Customer Reviews</h2>
          {stats && stats.totalReviews > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(stats.averageRating, false, 'w-5 h-5')}
                </div>
                <span className="text-xl font-bold text-foreground">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-foreground/60">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
          {stats && stats.totalReviews === 0 && (
            <p className="text-foreground/60">No reviews yet</p>
          )}
        </div>

        {!userReview && !showReviewForm && (
          <button
            onClick={handleWriteReview}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
          >
            Give Review
          </button>
        )}
      </div>

      {/* Rating Distribution - Compact */}
      {/* {stats && stats.totalReviews > 0 && stats.ratingDistribution && (
        <div className="inline-block bg-surface rounded-xl p-4 border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">Rating Distribution</h3>
          <div className="space-y-2 min-w-[200px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-xs font-medium text-foreground/80">{star}</span>
                    <Star className="w-3 h-3 fill-secondary text-secondary" />
                  </div>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/60 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )} */}

      {/* Error Message (only show for actual errors, not empty state) */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg hover:bg-muted transition"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rating <span className="text-danger">*</span>
              </label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {renderStars(hoveredRating || rating, true)}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="review-title" className="block text-sm font-medium text-foreground mb-2">
                Title (optional)
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Your Review (optional)
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-foreground/60 mt-1">{comment.length}/1000</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Add Photos (optional)
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={img.url}
                        alt={img.alt || 'Review image'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition">
                    {uploadingImages ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-foreground/60" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-foreground/60">
                You can upload up to 5 images (max 5MB each)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && !showReviewForm && (
        <div className="bg-surface rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Your Review</h3>
              <div className="flex items-center gap-2">
                {renderStars(userReview.rating)}
                <span className="text-sm text-foreground/60">
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-muted transition"
                aria-label="Edit review"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-danger/10 text-danger transition"
                aria-label="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {userReview.title && (
            <h4 className="font-medium text-foreground mb-2">{userReview.title}</h4>
          )}
          {userReview.comment && (
            <p className="text-foreground/70 mb-4">{userReview.comment}</p>
          )}
          {userReview.images && userReview.images.length > 0 && (
            <div className="flex gap-3 mt-4">
              {userReview.images.map((img, index) => (
                <div key={index} className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={img.url}
                    alt={img.alt || 'Review image'}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {!error && (
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <div className="flex flex-col items-center gap-3">
                <Star className="w-12 h-12 text-foreground/20" />
                <p className="text-foreground/70 font-medium">No reviews yet</p>
                <p className="text-sm text-foreground/60">
                  Be the first to review this product!
                </p>
                {!user && (
                  <button
                    onClick={handleWriteReview}
                    className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
                  >
                    Give Review
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
            <div key={review._id} className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {review.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {review.user.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-xs text-foreground/60">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-success/10 text-success rounded-md font-medium">
                      <Check className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
              {review.title && (
                <h5 className="font-semibold text-foreground mb-2">{review.title}</h5>
              )}
              {review.comment && (
                <p className="text-foreground/70 mb-4 whitespace-pre-wrap leading-relaxed">{review.comment}</p>
              )}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {review.images.map((img, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition hover:scale-105"
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || 'Review image'}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
              ))}
              
              {/* View All Reviews Link - Only show on product page when there are more reviews */}
              {!showAll && stats && stats.totalReviews > reviews.length && productSlug && (
                <div className="pt-4 border-t border-border">
                  <Link
                    href={`/products/${productSlug}/reviews`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <span>View All {stats.totalReviews} Reviews</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

