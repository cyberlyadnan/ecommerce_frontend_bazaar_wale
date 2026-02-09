'use client';

import { apiClient } from '@/lib/apiClient';

export type PaymentMode = 'bank' | 'upi' | 'cash' | 'other';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'rejected';

export type PayoutDto = {
  _id: string;
  vendorId: any; // populated for admin list
  grossAmount?: number;
  commissionPercent?: number;
  commissionAmount?: number;
  netAmount?: number;
  amount: number;
  currency: string;
  ordersIncluded?: string[];
  status: PayoutStatus;
  scheduledAt?: string;
  paidAt?: string;
  adminNotes?: string;
  paymentReference?: string;
  paymentMode?: PaymentMode;
  createdAt: string;
  updatedAt: string;
};

export const getAdminCommission = (accessToken: string) =>
  apiClient<{ success: boolean; commissionPercent: number }>('/api/payments/admin/commission', {
    method: 'GET',
    accessToken,
  });

export const updateAdminCommission = (commissionPercent: number, accessToken: string) =>
  apiClient<{ success: boolean; commissionPercent: number; message: string }>(
    '/api/payments/admin/commission',
    {
      method: 'PUT',
      body: JSON.stringify({ commissionPercent }),
      accessToken,
    },
  );

export const adminListPayouts = (
  accessToken: string,
  params?: { status?: 'all' | PayoutStatus; vendorId?: string; search?: string; limit?: number; skip?: number },
) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.vendorId) qs.set('vendorId', params.vendorId);
  if (params?.search) qs.set('search', params.search);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.skip) qs.set('skip', String(params.skip));
  const url = `/api/payments/admin/payouts${qs.toString() ? `?${qs.toString()}` : ''}`;
  return apiClient<{ success: boolean; payouts: PayoutDto[]; total: number }>(url, {
    method: 'GET',
    accessToken,
  });
};

export const adminCreatePayout = (
  payload: {
    vendorId: string;
    grossAmount?: number;
    commissionPercent?: number;
    status?: PayoutStatus;
    paymentMode?: PaymentMode;
    paymentReference?: string;
    adminNotes?: string;
    scheduledAt?: string;
  },
  accessToken: string,
) =>
  apiClient<{ success: boolean; payout: PayoutDto; message: string }>('/api/payments/admin/payouts', {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

export const adminUpdatePayout = (
  payoutId: string,
  payload: Partial<{
    status: PayoutStatus;
    paymentMode: PaymentMode;
    paymentReference: string;
    adminNotes: string;
    scheduledAt: string | null;
    paidAt: string | null;
  }>,
  accessToken: string,
) =>
  apiClient<{ success: boolean; payout: PayoutDto; message: string }>(`/api/payments/admin/payouts/${payoutId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

export const vendorPaymentsSummary = (accessToken: string) =>
  apiClient<{
    success: boolean;
    summary: { totalPaid: number; totalPending: number; lifetimeGross: number; lifetimeCommission: number };
  }>('/api/payments/vendor/summary', {
    method: 'GET',
    accessToken,
  });

export const vendorListPayouts = (
  accessToken: string,
  status?: 'all' | PayoutStatus,
  options?: { limit?: number; skip?: number },
) => {
  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (options?.limit) qs.set('limit', String(options.limit));
  if (options?.skip) qs.set('skip', String(options.skip));
  const url = `/api/payments/vendor/payouts${qs.toString() ? `?${qs.toString()}` : ''}`;
  return apiClient<{ success: boolean; payouts: PayoutDto[]; total: number }>(url, {
    method: 'GET',
    accessToken,
  });
};

const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) return envUrl.replace(/\/+$/, '');
    return `http://${envUrl.replace(/^\/+/, '')}`;
  }
  return 'http://localhost:5000';
};

/** Download payout slip PDF (admin). Triggers browser download. */
export async function downloadPayoutSlipPdf(payoutId: string, accessToken: string): Promise<void> {
  const url = `${getApiBaseUrl()}/api/payments/admin/payouts/${payoutId}/slip`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(res.status === 403 ? 'Admin access required' : 'Failed to download slip');
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] ?? `payout-slip-${payoutId}.pdf`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}


