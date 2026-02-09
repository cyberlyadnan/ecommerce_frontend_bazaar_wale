const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl.replace(/\/+$/, '');
    }
    return `http://${envUrl.replace(/^\/+/, '')}`;
  }
  return 'http://localhost:5000';
};

export type AnalyticsEventType = 'page_view' | 'product_view' | 'session_start';

export interface RecordEventPayload {
  type: AnalyticsEventType;
  visitorId?: string;
  sessionId?: string;
  productId?: string;
  path?: string;
  referrer?: string;
  title?: string;
}

export async function recordAnalyticsEvent(payload: RecordEventPayload): Promise<void> {
  const url = `${getApiBaseUrl()}/api/analytics/events`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) {
      console.warn('[Analytics] Record event failed', res.status);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] Record event error', err);
    }
  }
}

// ——— Admin analytics (require auth) ———

import { apiClient } from '@/lib/apiClient';

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  totalProductViews: number;
  periodDays: number;
  from: string;
  to: string;
}

export interface TopProductView {
  productId: string;
  title: string;
  slug: string;
  viewCount: number;
  totalSold?: number;
}

export interface ProductViewCountRow {
  productId: string;
  title: string;
  slug: string;
  viewCount: number;
}

export interface VisitsByDay {
  date: string;
  pageViews: number;
  productViews: number;
  uniqueVisitors: number;
}

export interface TopPageRow {
  path: string;
  title?: string;
  views: number;
}

export interface SalesInsight {
  productId: string;
  title: string;
  slug: string;
  viewCount: number;
  totalSold: number;
  conversionRate: number;
}

export interface RevenueByDay {
  date: string;
  orderCount: number;
  revenue: number;
}

export const getAnalyticsOverview = (accessToken: string | null, days?: number) =>
  apiClient<AnalyticsOverview>(`/api/admin/analytics/overview${days != null ? `?days=${days}` : ''}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });

export const getTopViewedProducts = (accessToken: string | null, limit?: number, days?: number) => {
  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (days != null) params.set('days', String(days));
  const q = params.toString() ? `?${params.toString()}` : '';
  return apiClient<{ products: TopProductView[] }>(`/api/admin/analytics/top-products${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};

export const getProductViewCounts = (accessToken: string | null, limit?: number) => {
  const q = limit != null ? `?limit=${limit}` : '';
  return apiClient<{ products: ProductViewCountRow[] }>(`/api/admin/analytics/product-view-counts${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};

export const getVisitsOverTime = (accessToken: string | null, days?: number) => {
  const q = days != null ? `?days=${days}` : '';
  return apiClient<{ data: VisitsByDay[] }>(`/api/admin/analytics/visits-over-time${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};

export const getTopPages = (accessToken: string | null, limit?: number, days?: number) => {
  const params = new URLSearchParams();
  if (limit != null) params.set('limit', String(limit));
  if (days != null) params.set('days', String(days));
  const q = params.toString() ? `?${params.toString()}` : '';
  return apiClient<{ pages: TopPageRow[] }>(`/api/admin/analytics/top-pages${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};

export const getSalesInsights = (accessToken: string | null, limit?: number) => {
  const q = limit != null ? `?limit=${limit}` : '';
  return apiClient<{ insights: SalesInsight[] }>(`/api/admin/analytics/sales-insights${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};

export const getRevenueOverTime = (accessToken: string | null, days?: number) => {
  const q = days != null ? `?days=${days}` : '';
  return apiClient<{ data: RevenueByDay[] }>(`/api/admin/analytics/revenue-over-time${q}`, {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
};
