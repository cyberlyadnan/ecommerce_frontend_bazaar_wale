'use client';

import { apiClient } from '@/lib/apiClient';

export interface Address {
  label?: string;
  name: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: boolean;
  addresses: Address[];
  message?: string;
}

/**
 * Get all addresses for the authenticated user
 */
export const getUserAddresses = (accessToken: string) =>
  apiClient<AddressResponse>('/api/addresses', {
    method: 'GET',
    accessToken,
  });

/**
 * Add a new address
 */
export const addAddress = (address: Omit<Address, 'isDefault'> & { isDefault?: boolean }, accessToken: string) =>
  apiClient<AddressResponse>('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(address),
    accessToken,
  });

/**
 * Update an address by index
 */
export const updateAddress = (
  addressIndex: number,
  updates: Partial<Address>,
  accessToken: string,
) =>
  apiClient<AddressResponse>(`/api/addresses/${addressIndex}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    accessToken,
  });

/**
 * Delete an address by index
 */
export const deleteAddress = (addressIndex: number, accessToken: string) =>
  apiClient<AddressResponse>(`/api/addresses/${addressIndex}`, {
    method: 'DELETE',
    accessToken,
  });

/**
 * Set an address as default
 */
export const setDefaultAddress = (addressIndex: number, accessToken: string) =>
  apiClient<AddressResponse>(`/api/addresses/${addressIndex}/default`, {
    method: 'PATCH',
    accessToken,
  });
