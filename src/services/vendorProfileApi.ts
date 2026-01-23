import { apiClient } from '@/lib/apiClient';

export type VendorDocumentDto = {
  _id?: string | null;
  type?: string;
  url?: string; // Legacy - deprecated, use accessUrl instead
  fileName?: string;
  accessUrl?: string | null; // Secure API endpoint to access document
  legacyUrl?: string | null; // Legacy URL (deprecated)
};

export type VendorVerificationDto = {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  adminNotes?: string;
  documents: VendorDocumentDto[];
};

export type VendorProfileDto = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  gstNumber?: string;
  aadharNumber?: string;
  panNumber?: string;
  vendorStatus?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetVendorProfileResponse = {
  success: boolean;
  vendor: VendorProfileDto;
  verification: VendorVerificationDto | null;
};

export const getVendorProfile = (accessToken: string) =>
  apiClient<GetVendorProfileResponse>('/api/vendor/dashboard/profile', {
    method: 'GET',
    accessToken,
  });

export type UpdateVendorProfileResponse = {
  success: boolean;
  vendor: VendorProfileDto;
  message?: string;
};

export const updateVendorProfile = (accessToken: string, input: { name: string }) =>
  apiClient<UpdateVendorProfileResponse>('/api/vendor/dashboard/profile', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(input),
  });


