'use client';

import { apiClient } from '@/lib/apiClient';
import adminApiEndpoints from './adminApiEndpoints';

export type BlogStatus = 'draft' | 'published';

export interface BlogImageDto {
  url: string;
  alt?: string;
}

export interface BlogSeoDto {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: BlogImageDto;

  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: BlogImageDto;

  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

export interface BlogDto {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string; // only present when fetching single blog
  featuredImage?: BlogImageDto;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string;
  views: number;
  seo?: BlogSeoDto;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListBlogsResult {
  items: BlogDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicListBlogsResult extends AdminListBlogsResult {}

export interface CreateBlogPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  contentHtml: string;
  featuredImage?: BlogImageDto | null;
  tags?: string[];
  status?: BlogStatus;
  publishedAt?: string | null;
  seo?: BlogSeoDto;
  meta?: Record<string, unknown>;
}

export interface UpdateBlogPayload extends Partial<CreateBlogPayload> {}

export const adminFetchBlogs = (
  accessToken: string,
  options?: { search?: string; status?: 'draft' | 'published' | 'all'; page?: number; limit?: number },
) => {
  const params = new URLSearchParams();
  if (options?.search?.trim()) params.set('search', options.search.trim());
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const path = params.toString() ? `${adminApiEndpoints.blogs}?${params.toString()}` : adminApiEndpoints.blogs;

  return apiClient<AdminListBlogsResult>(path, {
    method: 'GET',
    accessToken,
  });
};

export const adminFetchBlogById = (blogId: string, accessToken: string) =>
  apiClient<{ blog: BlogDto }>(adminApiEndpoints.blogById(blogId), {
    method: 'GET',
    accessToken,
  });

export const adminCreateBlog = (payload: CreateBlogPayload, accessToken: string) =>
  apiClient<{ blog: BlogDto }>(adminApiEndpoints.blogs, {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

export const adminUpdateBlog = (blogId: string, payload: UpdateBlogPayload, accessToken: string) =>
  apiClient<{ blog: BlogDto }>(adminApiEndpoints.blogById(blogId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

export const adminDeleteBlog = (blogId: string, accessToken: string) =>
  apiClient<{ message: string }>(adminApiEndpoints.blogById(blogId), {
    method: 'DELETE',
    accessToken,
  });

export interface BlogStatsDto {
  total: number;
  drafts: number;
  published: number;
  topByViews: Array<Pick<BlogDto, '_id' | 'title' | 'slug' | 'views' | 'publishedAt'>>;
}

export const adminFetchBlogStats = (accessToken: string) =>
  apiClient<{ stats: BlogStatsDto }>(adminApiEndpoints.blogStats, {
    method: 'GET',
    accessToken,
  });

export const publicFetchBlogs = (options?: { search?: string; tag?: string; page?: number; limit?: number }) => {
  const params = new URLSearchParams();
  if (options?.search?.trim()) params.set('search', options.search.trim());
  if (options?.tag?.trim()) params.set('tag', options.tag.trim());
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const path = params.toString()
    ? `${adminApiEndpoints.publicBlogs}?${params.toString()}`
    : adminApiEndpoints.publicBlogs;

  return apiClient<PublicListBlogsResult>(path, {
    method: 'GET',
    skipAuthHeader: true,
  });
};

export const publicFetchBlogBySlug = (slug: string) =>
  apiClient<{ blog: BlogDto }>(adminApiEndpoints.publicBlogBySlug(slug), {
    method: 'GET',
    skipAuthHeader: true,
  });


