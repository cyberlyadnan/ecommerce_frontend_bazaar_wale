'use client';

import { apiClient } from '@/lib/apiClient';

export interface CartItemDto {
  productId: string | {
    _id: string;
    title: string;
    slug: string;
    images?: Array<{ url: string; alt?: string }>;
    price: number;
    minOrderQty: number;
    stock: number;
    isActive: boolean;
  };
  title: string;
  vendorId: string;
  pricePerUnit: number;
  qty: number;
  minOrderQty: number;
  meta?: {
    image?: string;
    slug?: string;
  };
}

export interface CartDto {
  _id: string;
  userId: string;
  items: CartItemDto[];
  updatedAt: string;
  createdAt: string;
}

export interface AddToCartPayload {
  productId: string;
  qty: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  qty: number;
}

export interface CartResponse {
  cart: CartDto | null;
  items: CartItemDto[];
  message?: string;
}

/**
 * Get user's cart
 */
export const getCart = (accessToken: string) =>
  apiClient<CartResponse>('/api/cart', {
    method: 'GET',
    accessToken,
  });

/**
 * Add item to cart
 */
export const addToCartApi = (payload: AddToCartPayload, accessToken: string) =>
  apiClient<CartResponse>('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

/**
 * Update cart item quantity
 */
export const updateCartItemApi = (payload: UpdateCartItemPayload, accessToken: string) =>
  apiClient<CartResponse>('/api/cart/update', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

/**
 * Remove item from cart
 */
export const removeFromCartApi = (productId: string, accessToken: string) =>
  apiClient<CartResponse>(`/api/cart/remove/${productId}`, {
    method: 'DELETE',
    accessToken,
  });

/**
 * Clear cart
 */
export const clearCartApi = (accessToken: string) =>
  apiClient<CartResponse>('/api/cart/clear', {
    method: 'DELETE',
    accessToken,
  });

