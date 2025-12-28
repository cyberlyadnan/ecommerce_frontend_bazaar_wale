'use client';

import { apiClient } from '@/lib/apiClient';

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
}

export interface OrderCalculation {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  items: Array<{
    productId: string;
    title: string;
    sku?: string;
    vendorId: string;
    vendorSnapshot: {
      vendorName: string;
      vendorPhone?: string;
    };
    qty: number;
    pricePerUnit: number;
    totalPrice: number;
  }>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  sku?: string;
  vendorId: string;
  vendorSnapshot: {
    vendorName: string;
    vendorPhone?: string;
  };
  qty: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'cod' | 'other';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status:
    | 'created'
    | 'vendor_shipped_to_warehouse'
    | 'received_in_warehouse'
    | 'packed'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  shippingAddress: ShippingAddress;
  expectedDeliveryDate?: string;
  shippedDate?: string;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  razorpayOrder: RazorpayOrder;
  message: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  order: Order;
  message: string;
}

/**
 * Calculate order totals (pre-checkout)
 */
export const calculateOrderTotals = (accessToken: string) =>
  apiClient<{ success: boolean; calculation: OrderCalculation }>(
    '/api/orders/calculate',
    {
      method: 'GET',
      accessToken,
    },
  );

/**
 * Create order and Razorpay order
 */
export const createOrder = (
  shippingAddress: ShippingAddress,
  accessToken: string,
) =>
  apiClient<CreateOrderResponse>('/api/orders/create', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress }),
    accessToken,
  });

/**
 * Verify payment and complete order
 */
export const verifyPayment = (
  orderId: string,
  paymentData: VerifyPaymentPayload,
  accessToken: string,
) =>
  apiClient<VerifyPaymentResponse>(`/api/orders/${orderId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
    accessToken,
  });

/**
 * Get user orders
 */
export const getUserOrders = (accessToken: string) =>
  apiClient<{ success: boolean; orders: Order[] }>('/api/orders', {
    method: 'GET',
    accessToken,
  });

/**
 * Get order by ID
 */
export const getOrderById = (orderId: string, accessToken: string) =>
  apiClient<{ success: boolean; order: Order }>(`/api/orders/${orderId}`, {
    method: 'GET',
    accessToken,
  });

/**
 * Get vendor orders (without customer details)
 */
export const getVendorOrders = (accessToken: string) =>
  apiClient<{ success: boolean; orders: Order[] }>('/api/orders/vendor', {
    method: 'GET',
    accessToken,
  });

/**
 * Get admin orders (with full details)
 */
export const getAdminOrders = (
  accessToken: string,
  filter?: 'all' | 'admin_only',
  status?: string,
  search?: string,
) => {
  const params = new URLSearchParams();
  if (filter && filter !== 'all') {
    params.set('filter', filter);
  }
  if (status && status !== 'all') {
    params.set('status', status);
  }
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  const queryString = params.toString();
  return apiClient<{
    success: boolean;
    orders: (Order & {
      customer?: { name: string; email?: string; phone?: string };
      vendors?: Array<{
        _id: string;
        name: string;
        businessName?: string;
        gstNumber?: string;
        role: string;
      }>;
    })[];
  }>(`/api/orders/admin${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    accessToken,
  });
};

/**
 * Get admin order by ID (with full details)
 */
export const getAdminOrderById = (orderId: string, accessToken: string) =>
  apiClient<{
    success: boolean;
    order: Order & {
      customer?: { name: string; email?: string; phone?: string };
      vendors?: Array<{
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        businessName?: string;
        gstNumber?: string;
        role: string;
      }>;
    };
  }>(`/api/orders/admin/${orderId}`, {
    method: 'GET',
    accessToken,
  });

/**
 * Update order status
 */
export const updateOrderStatus = (
  orderId: string,
  status: Order['status'],
  accessToken: string,
) =>
  apiClient<{ success: boolean; order: Order; message: string }>(
    `/api/orders/${orderId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      accessToken,
    },
  );

/**
 * Update expected delivery date (admin only)
 */
export const updateExpectedDeliveryDate = (
  orderId: string,
  expectedDeliveryDate: string,
  accessToken: string,
) =>
  apiClient<{ success: boolean; order: Order; message: string }>(
    `/api/orders/${orderId}/expected-delivery-date`,
    {
      method: 'PATCH',
      body: JSON.stringify({ expectedDeliveryDate }),
      accessToken,
    },
  );

