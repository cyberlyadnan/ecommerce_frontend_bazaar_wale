import "server-only";

import { cache } from "react";
import type { ProductDto } from "./catalogApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

interface FetchOptions extends RequestInit {
  next?: { revalidate?: number };
}

async function fetchJson<T>(url: string, init?: FetchOptions): Promise<T> {
  const requestInit: FetchOptions = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: init?.next ?? { revalidate: 60 },
  };

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload && (payload as { message?: string }).message) ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }

  return response.json();
}

export const getProductBySlug = cache(async (slug: string): Promise<ProductDto | null> => {
  const url = `${API_BASE_URL}/api/catalog/products/slug/${encodeURIComponent(slug)}`;
  try {
    const { product } = await fetchJson<{ product: ProductDto }>(url);
    return product ?? null;
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return null;
    }
    throw error;
  }
});

export const getFeaturedProducts = cache(async (limit = 8): Promise<ProductDto[]> => {
  const url = `${API_BASE_URL}/api/catalog/products/public?featured=true&limit=${limit}`;
  const { products } = await fetchJson<{ products: ProductDto[] }>(url, {
    next: { revalidate: 300 },
  });
  return products ?? [];
});

export const getPublicProductsByCategory = cache(
  async (categorySlug: string, options?: { limit?: number; skip?: number }): Promise<{ products: ProductDto[]; total: number }> => {
    const params = new URLSearchParams({ category: categorySlug });
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.skip !== undefined) params.set('skip', String(options.skip));
    const url = `${API_BASE_URL}/api/catalog/products/public?${params.toString()}`;
    const data = await fetchJson<{ products: ProductDto[]; total?: number }>(url, {
      next: { revalidate: 60 },
    });
    return {
      products: data.products ?? [],
      total: data.total ?? data.products?.length ?? 0,
    };
  }
);



