'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/store/redux/store';
import { formatCurrency } from '@/utils/currency';
import { ApiClientError } from '@/lib/apiClient';
import { getOrderById, type Order } from '@/services/orderApi';

const getStatusBadge = (status: Order['status']) => {
  const badges = {
    created: {
      label: 'Processing',
      className: 'bg-amber-500/10 text-amber-600',
      icon: Clock,
    },
    vendor_shipped_to_warehouse: {
      label: 'Shipped to Warehouse',
      className: 'bg-purple-500/10 text-purple-600',
      icon: Package,
    },
    received_in_warehouse: {
      label: 'Received in Warehouse',
      className: 'bg-indigo-500/10 text-indigo-600',
      icon: Package,
    },
    packed: {
      label: 'Packed',
      className: 'bg-amber-500/10 text-amber-600',
      icon: Package,
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-cyan-500/10 text-cyan-600',
      icon: Package,
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-emerald-500/10 text-emerald-600',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-rose-500/10 text-rose-600',
      icon: XCircle,
    },
  };

  const badge = badges[status] || badges.created;
  const Icon = badge.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${badge.className} px-3 py-1 text-xs font-semibold`}
    >
      <Icon size={14} />
      {badge.label}
    </span>
  );
};

const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
  const badges = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-600',
    },
    paid: {
      label: 'Paid',
      className: 'bg-emerald-500/10 text-emerald-600',
    },
    failed: {
      label: 'Failed',
      className: 'bg-rose-500/10 text-rose-600',
    },
    refunded: {
      label: 'Refunded',
      className: 'bg-blue-500/10 text-blue-600',
    },
  };

  const badge = badges[status] || badges.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${badge.className} px-3 py-1 text-xs font-semibold`}
    >
      {badge.label}
    </span>
  );
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const orderId = params.orderId as string;
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Order confirmed.');
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please contact support.');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled.');
    }
  }, [paymentStatus]);

  useEffect(() => {
    if (!accessToken || !orderId) {
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderById(orderId, accessToken);
        setOrder(response.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Failed to load order details',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [accessToken, orderId]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted">Loading order details...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !order) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
            {error || 'Order not found'}
          </div>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted mt-2">
            Placed on{' '}
            {new Date(order.placedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Payment Status Alert */}
        {paymentStatus === 'success' && order.paymentStatus === 'paid' && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-semibold">Payment Successful!</p>
              <p className="text-sm">
                Your order has been confirmed and payment has been received.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      {item.sku && (
                        <p className="text-sm text-muted">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-muted mt-1">
                        Vendor: {item.vendorSnapshot.vendorName}
                      </p>
                      <p className="text-sm text-muted">
                        Quantity: {item.qty} × {formatCurrency(item.pricePerUnit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Shipping Address
              </h2>
              <div className="text-sm text-foreground">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p className="text-muted">{order.shippingAddress.phone}</p>
                <p className="mt-2">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Status</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Payment</span>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-foreground">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="text-foreground">
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax (GST)</span>
                  <span className="text-foreground">
                    {formatCurrency(order.tax)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-border mb-4">
                <span className="text-base font-semibold text-foreground">
                  Total
                </span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(order.total)}
                </span>
              </div>

              {order.razorpayPaymentId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted mb-1">Payment ID</p>
                  <p className="text-xs font-mono text-foreground break-all">
                    {order.razorpayPaymentId}
                  </p>
                </div>
              )}

              {/* Expected Delivery Date */}
              {order.expectedDeliveryDate && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted" />
                    <p className="text-xs text-muted">Expected Delivery</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* Shipped Date */}
              {order.shippedDate && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-muted" />
                    <p className="text-xs text-muted">Shipped Date</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(order.shippedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AuthGuard>
  );
}

