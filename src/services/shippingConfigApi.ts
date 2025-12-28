'use client';

import { apiClient } from '@/lib/apiClient';

export type ShippingConfig = {
  isEnabled: boolean;
  flatRate: number;
  freeShippingThreshold: number;
  updatedAt?: string;
};

export const getAdminShippingConfig = (accessToken: string) =>
  apiClient<{ success: boolean; config: ShippingConfig }>('/api/orders/admin/shipping-config', {
    method: 'GET',
    accessToken,
  });

export const updateAdminShippingConfig = (
  payload: { isEnabled: boolean; flatRate: number; freeShippingThreshold: number },
  accessToken: string,
) =>
  apiClient<{ success: boolean; config: ShippingConfig; message: string }>(
    '/api/orders/admin/shipping-config',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
      accessToken,
    },
  );


