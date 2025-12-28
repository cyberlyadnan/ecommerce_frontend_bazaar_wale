'use client';

import { apiClient } from '@/lib/apiClient';

export interface ReviewImageDto {
  url: string;
  alt?: string;
}

export interface ReviewDto {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  images: ReviewImageDto[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: ReviewImageDto[];
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  comment?: string;
  images?: ReviewImageDto[];
}

export interface ProductReviewsResponse {
  reviews: ReviewDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

export interface UserReviewResponse {
  review: ReviewDto | null;
}

export interface ReviewResponse {
  message: string;
  review: ReviewDto;
}

/**
 * Get product reviews
 */
export const getProductReviews = (
  productId: string,
  options: { page?: number; limit?: number; sortBy?: string } = {},
) => {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.sortBy) params.append('sortBy', options.sortBy);

  const query = params.toString();
  const url = `/api/reviews/product/${productId}${query ? `?${query}` : ''}`;

  return apiClient<ProductReviewsResponse>(url, {
    method: 'GET',
    skipAuthHeader: true,
  });
};

/**
 * Get user's review for a product
 */
export const getUserReview = (productId: string, accessToken: string) =>
  apiClient<UserReviewResponse>(`/api/reviews/product/${productId}/user`, {
    method: 'GET',
    accessToken,
  });

/**
 * Create a review
 */
export const createReview = (payload: CreateReviewPayload, accessToken: string) =>
  apiClient<ReviewResponse>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

/**
 * Update a review
 */
export const updateReview = (reviewId: string, payload: UpdateReviewPayload, accessToken: string) =>
  apiClient<ReviewResponse>(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    accessToken,
  });

/**
 * Delete a review
 */
export const deleteReview = (reviewId: string, accessToken: string) =>
  apiClient<{ message: string }>(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
    accessToken,
  });

/**
 * Upload review image
 */
export const uploadReviewImage = (file: File, accessToken: string) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<{ file: { id: string; url: string; originalName: string; size: number } }>(
    '/api/files/upload/review',
    {
      method: 'POST',
      body: formData,
      accessToken,
    },
  );
};

