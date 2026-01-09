'use client';

import { apiClient } from '@/lib/apiClient';

import adminApiEndpoints from './adminApiEndpoints';

export interface CategoryDto {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends Omit<CategoryDto, 'parent' | 'createdAt' | 'updatedAt'> {
  parent?: string | null;
  children: CategoryTreeNode[];
}

export interface ProductImageDto {
  url: string;
  alt?: string;
  order?: number;
}

export interface PricingTierDto {
  minQty: number;
  pricePerUnit: number;
}

export interface ProductDto {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  category?: CategoryDto | null;
  subcategory?: CategoryDto | null;
  images: ProductImageDto[];
  attributes: Record<string, string>;
  stock: number;
  minOrderQty: number;
  weightKg?: number;
  vendor?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    businessName?: string;
    gstNumber?: string;
  } | null;
  price: number;
  pricingTiers: PricingTierDto[];
  taxCode?: string;
  taxPercentage?: number;
  isActive: boolean;
  approvedByAdmin: boolean;
  featured?: boolean;
  tags: string[];
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parent?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export interface CreateProductPayload {
  title: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  category?: string | null;
  subcategory?: string | null;
  images?: ProductImageDto[];
  attributes?: Record<string, string>;
  stock?: number;
  minOrderQty?: number;
  weightKg?: number;
  vendorId: string;
  price: number;
  pricingTiers?: PricingTierDto[];
  taxCode?: string;
  taxPercentage?: number;
  isActive?: boolean;
  approvedByAdmin?: boolean;
  featured?: boolean;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export const fetchCategories = () =>
  apiClient<{ categories: CategoryDto[]; tree: CategoryTreeNode[] }>(adminApiEndpoints.categories, {
    method: 'GET',
    skipAuthHeader: true,
  });

export interface FetchProductsOptions {
  search?: string;
  scope?: 'all' | 'mine';
}

export interface VendorDto {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  gstNumber?: string;
  aadharNumber?: string;
  panNumber?: string;
  vendorStatus: string;
  createdAt: string;
  updatedAt: string;
  businessAddress?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  verification?: {
    status: string;
    submittedAt?: string;
    reviewedAt?: string;
    adminNotes?: string;
    documents?: Array<{ type?: string; url?: string; fileName?: string }>;
  } | null;
}

export interface FetchVendorsOptions {
  search?: string;
  status?: 'all' | 'pending' | 'active' | 'rejected' | 'suspended';
}

export interface UploadedFileDto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface UploadMediaOptions {
  folder?: string;
}

export const createCategoryApi = (payload: CreateCategoryPayload, accessToken?: string | null) =>
  apiClient<{ category: CategoryDto }>(adminApiEndpoints.categories, {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

export const updateCategoryApi = (
  categoryId: string,
  payload: UpdateCategoryPayload,
  accessToken?: string | null,
) =>
  apiClient<{ category: CategoryDto }>(adminApiEndpoints.categoryById(categoryId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

export const deleteCategoryApi = (categoryId: string, accessToken?: string | null) =>
  apiClient<{ message: string }>(adminApiEndpoints.categoryById(categoryId), {
    method: 'DELETE',
    accessToken,
  });

export const fetchProducts = (
  accessToken?: string | null,
  options?: FetchProductsOptions,
) => {
  let path: string = adminApiEndpoints.products;
  const params = new URLSearchParams();

  if (options?.search && options.search.trim().length > 0) {
    params.set('search', options.search.trim());
  }

  if (options?.scope && options.scope !== 'all') {
    params.set('scope', options.scope);
  }

  const queryString = params.toString();
  if (queryString) {
    path = `${path}?${queryString}`;
  }

  return apiClient<{ products: ProductDto[] }>(path, {
    method: 'GET',
    accessToken,
  });
};

export const fetchVendors = (
  accessToken: string,
  options?: FetchVendorsOptions,
) => {
  const params = new URLSearchParams();
  if (options?.search && options.search.trim().length > 0) {
    params.set('search', options.search.trim());
  }
  if (options?.status && options.status !== 'all') {
    params.set('status', options.status);
  }
  const path = params.toString()
    ? `${adminApiEndpoints.vendors}?${params.toString()}`
    : adminApiEndpoints.vendors;

  return apiClient<{ vendors: VendorDto[] }>(path, {
    method: 'GET',
    accessToken,
  });
};

export const approveVendorApi = (vendorId: string, accessToken: string) =>
  apiClient<{ vendor: VendorDto }>(adminApiEndpoints.vendorApprove(vendorId), {
    method: 'POST',
    accessToken,
  });

export const rejectVendorApi = (
  vendorId: string,
  payload: { reason?: string },
  accessToken: string,
) =>
  apiClient<{ vendor: VendorDto }>(adminApiEndpoints.vendorReject(vendorId), {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

export const uploadMedia = (
  file: File,
  accessToken: string,
  options?: UploadMediaOptions,
) => {
  const formData = new FormData();
  formData.append('file', file);

  let endpoint: string = adminApiEndpoints.uploadMedia;
  if (options?.folder) {
    const params = new URLSearchParams({ folder: options.folder });
    endpoint = `${endpoint}?${params.toString()}`;
  }

  return apiClient<{ file: UploadedFileDto }>(endpoint, {
    method: 'POST',
    body: formData,
    accessToken,
  });
};

export const fetchProductById = (productId: string, accessToken?: string | null) =>
  apiClient<{ product: ProductDto }>(adminApiEndpoints.productById(productId), {
    method: 'GET',
    accessToken,
  });

/**
 * Fetch public products (no authentication required)
 */
export const fetchPublicProducts = (options?: { search?: string; limit?: number }) => {
  let path = '/api/catalog/products/public';
  const params = new URLSearchParams();

  if (options?.search && options.search.trim().length > 0) {
    params.set('search', options.search.trim());
  }

  if (options?.limit && options.limit > 0) {
    params.set('limit', options.limit.toString());
  }

  const queryString = params.toString();
  if (queryString) {
    path = `${path}?${queryString}`;
  }

  return apiClient<{ products: ProductDto[] }>(path, {
    method: 'GET',
    skipAuthHeader: true,
  });
};

/**
 * Fetch product by slug (client-side, no authentication required)
 */
export const fetchProductBySlug = (slug: string) => {
  const path = `/api/catalog/products/slug/${encodeURIComponent(slug)}`;
  return apiClient<{ product: ProductDto }>(path, {
    method: 'GET',
    skipAuthHeader: true,
  });
};

export const createProductApi = (payload: CreateProductPayload, accessToken?: string | null) =>
  apiClient<{ product: ProductDto }>(adminApiEndpoints.products, {
    method: 'POST',
    body: JSON.stringify(payload),
    accessToken,
  });

export const updateProductApi = (
  productId: string,
  payload: UpdateProductPayload,
  accessToken?: string | null,
) =>
  apiClient<{ product: ProductDto }>(adminApiEndpoints.productById(productId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
    accessToken,
  });

export const deleteProductApi = (productId: string, accessToken: string) =>
  apiClient<{ message: string }>(adminApiEndpoints.productById(productId), {
    method: 'DELETE',
    accessToken,
  });


