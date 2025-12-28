'use client';

import { apiClient } from '@/lib/apiClient';

export interface ContactQueryDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  adminResponse?: string;
  respondedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactQueriesResponse {
  contacts: ContactQueryDto[];
  total: number;
}

export interface UpdateContactQueryPayload {
  status?: 'new' | 'read' | 'replied' | 'closed';
  adminResponse?: string;
}

/**
 * Submit contact form (public, no auth required)
 */
export const submitContactForm = (payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) =>
  apiClient<{ message: string; contact: ContactQueryDto }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

/**
 * Get all contact queries (admin only)
 */
export const getContactQueries = (
  accessToken: string,
  options?: { status?: string; limit?: number; skip?: number },
) => {
  let path = '/api/contact';
  const params = new URLSearchParams();

  if (options?.status) {
    params.set('status', options.status);
  }
  if (options?.limit) {
    params.set('limit', options.limit.toString());
  }
  if (options?.skip) {
    params.set('skip', options.skip.toString());
  }

  const queryString = params.toString();
  if (queryString) {
    path = `${path}?${queryString}`;
  }

  return apiClient<ContactQueriesResponse>(path, {
    method: 'GET',
    accessToken,
  });
};

/**
 * Get contact query by ID (admin only)
 */
export const getContactQueryById = (contactId: string, accessToken: string) =>
  apiClient<{ contact: ContactQueryDto }>(`/api/contact/${contactId}`, {
    method: 'GET',
    accessToken,
  });

/**
 * Update contact query (admin only)
 */
export const updateContactQuery = (
  contactId: string,
  payload: UpdateContactQueryPayload,
  accessToken: string,
) =>
  apiClient<{ message: string; contact: ContactQueryDto }>(`/api/contact/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

/**
 * Delete contact query (admin only)
 */
export const deleteContactQuery = (contactId: string, accessToken: string) =>
  apiClient<{ message: string }>(`/api/contact/${contactId}`, {
    method: 'DELETE',
    accessToken,
  });

