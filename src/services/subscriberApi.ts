'use client';

import { apiClient } from '@/lib/apiClient';

export interface SubscriberDto {
  _id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
  updatedAt: string;
}

export interface SubscribersResponse {
  subscribers: SubscriberDto[];
  total: number;
}

export const subscribeNewsletter = (email: string) =>
  fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to subscribe');
    return data;
  });

export const getSubscribers = (
  accessToken: string,
  params?: { status?: string; limit?: number; skip?: number },
) => {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.skip) search.set('skip', String(params.skip));
  const qs = search.toString();
  const path = `/api/subscribers${qs ? `?${qs}` : ''}`;
  return apiClient<SubscribersResponse>(path, { method: 'GET', accessToken });
};
