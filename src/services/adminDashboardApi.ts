import { apiClient } from '@/lib/apiClient';

export interface AdminDashboardStats {
  revenue: {
    total: number;
    formatted: string;
    paidOrdersCount: number;
  };
  vendors: {
    active: number;
    pending: number;
    total: number;
    rejected: number;
    suspended: number;
  };
  orders: {
    total: number;
    open: number;
    paidPendingFulfilment: number;
    cancelled: number;
  };
  products: {
    total: number;
    active: number;
    pendingApproval: number;
    featured: number;
  };
  pipeline: {
    submittedApplications: number;
    approvedVendors: number;
    kycInReview: number;
  };
  support: {
    unreadQueries: number;
    totalSubscribers: number;
  };
}

export interface AdminDashboardStatsResponse {
  stats: AdminDashboardStats;
}

export const getAdminDashboardStats = (accessToken: string | null) =>
  apiClient<AdminDashboardStatsResponse>('/api/admin/dashboard/stats', {
    method: 'GET',
    accessToken: accessToken ?? undefined,
  });
