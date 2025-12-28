import 'server-only';

import { cache } from 'react';
import type { BlogDto, PublicListBlogsResult } from './blogApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  next?: { revalidate?: number };
}

async function fetchJson<T>(url: string, init?: FetchOptions): Promise<T> {
  const requestInit: FetchOptions = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: init?.next ?? { revalidate: 120 },
  };

  const response = await fetch(url, requestInit);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload && (payload as { message?: string }).message) ||
      response.statusText ||
      'Request failed';
    throw new Error(message);
  }

  return response.json();
}

export const getPublicBlogs = cache(
  async (options?: { search?: string; tag?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (options?.search?.trim()) params.set('search', options.search.trim());
    if (options?.tag?.trim()) params.set('tag', options.tag.trim());
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));

    const url = `${API_BASE_URL}/api/blog${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchJson<PublicListBlogsResult>(url, { next: { revalidate: 120 } });
  },
);

export const getPublicBlogBySlug = cache(async (slug: string): Promise<BlogDto | null> => {
  const url = `${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}?trackView=0`;
  try {
    const { blog } = await fetchJson<{ blog: BlogDto }>(url, { next: { revalidate: 120 } });
    return blog ?? null;
  } catch (error) {
    if (error instanceof Error && error.message === 'Blog not found') {
      return null;
    }
    throw error;
  }
});


