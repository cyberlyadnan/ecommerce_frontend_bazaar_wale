import { apiClient } from '@/lib/apiClient';

export interface VendorDashboardStats {
  revenue: {
    total: number;
    formatted: string;
  };
  products: {
    active: number;
    total: number;
    pending: number;
  };
  orders: {
    open: number;
    requiringDispatch: number;
    total: number;
  };
  fulfilment: {
    rate: number;
    packedReady: number;
    awaitingPickup: number;
    delayedDispatch: number;
  };
}

export interface VendorDashboardStatsResponse {
  success: boolean;
  stats: VendorDashboardStats;
}

/**
 * Get vendor dashboard statistics
 */
export const getVendorDashboardStats = (accessToken: string) =>
  apiClient<VendorDashboardStatsResponse>('/api/vendor/dashboard/stats', {
    method: 'GET',
    accessToken,
  });

