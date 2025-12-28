'use client';

import { apiClient } from '@/lib/apiClient';

export type UploadedFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

export const uploadVendorApplicationDoc = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // public upload (no auth) with a dedicated folder
  return apiClient<{ file: UploadedFile }>(`/api/files/upload/vendor-application?folder=vendor-documents`, {
    method: 'POST',
    body: formData,
    skipAuthHeader: true,
  });
};


