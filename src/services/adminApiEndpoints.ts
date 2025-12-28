const ADMIN_API_BASE = "/api/catalog";
const FILES_API_BASE = "/api/files";
const ADMIN_BLOGS_BASE = "/api/admin/blogs";
const PUBLIC_BLOGS_BASE = "/api/blog";

export const adminApiEndpoints = {
  categories: `${ADMIN_API_BASE}/categories`,
  categoryById: (categoryId: string) => `${ADMIN_API_BASE}/categories/${categoryId}`,
  products: `${ADMIN_API_BASE}/products`,
  productById: (productId: string) => `${ADMIN_API_BASE}/products/${productId}`,
  vendors: `${ADMIN_API_BASE}/vendors`,
  vendorApprove: (vendorId: string) => `${ADMIN_API_BASE}/vendors/${vendorId}/approve`,
  vendorReject: (vendorId: string) => `${ADMIN_API_BASE}/vendors/${vendorId}/reject`,
  uploadMedia: `${FILES_API_BASE}/upload`,
  blogs: `${ADMIN_BLOGS_BASE}`,
  blogById: (blogId: string) => `${ADMIN_BLOGS_BASE}/${blogId}`,
  blogStats: `${ADMIN_BLOGS_BASE}/stats`,
  publicBlogs: `${PUBLIC_BLOGS_BASE}`,
  publicBlogBySlug: (slug: string) => `${PUBLIC_BLOGS_BASE}/${slug}`,
} as const;

export default adminApiEndpoints;


