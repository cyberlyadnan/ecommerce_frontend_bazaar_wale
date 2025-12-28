'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, CheckCircle2, Clock, XCircle, Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/store/redux/store';
import { getUserOrders, type Order } from '@/services/orderApi';
import { ApiClientError } from '@/lib/apiClient';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    case 'shipped':
    case 'packed':
    case 'received_in_warehouse':
    case 'vendor_shipped_to_warehouse':
      return <Clock className="w-5 h-5 text-amber-600" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-rose-600" />;
    default:
      return <Package className="w-5 h-5 text-muted" />;
  }
};

const getStatusBadge = (status: Order['status']) => {
  const statusLabels: Record<Order['status'], string> = {
    created: 'Processing',
    vendor_shipped_to_warehouse: 'Shipped to Warehouse',
    received_in_warehouse: 'Received in Warehouse',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusColors: Record<Order['status'], string> = {
    created: 'bg-amber-500/10 text-amber-600',
    vendor_shipped_to_warehouse: 'bg-purple-500/10 text-purple-600',
    received_in_warehouse: 'bg-indigo-500/10 text-indigo-600',
    packed: 'bg-amber-500/10 text-amber-600',
    shipped: 'bg-cyan-500/10 text-cyan-600',
    delivered: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-rose-500/10 text-rose-600',
  };

  const label = statusLabels[status] || status;
  const colorClass = statusColors[status] || 'bg-muted text-muted-foreground';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${colorClass} px-3 py-1 text-xs font-semibold`}>
      {status === 'delivered' && <CheckCircle2 size={14} />}
      {status !== 'delivered' && status !== 'cancelled' && <Clock size={14} />}
      {status === 'cancelled' && <XCircle size={14} />}
      {label}
    </span>
  );
};

export default function OrdersPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getUserOrders(accessToken);
        setOrders(response.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Failed to load orders. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [accessToken]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted">Loading orders...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted mt-2">Track and manage your orders</p>
        </div>

        {error && (
          <div className="mb-6 bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted mb-6">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-foreground">Order {order.orderNumber}</h3>
                        <p className="text-sm text-muted">
                          {new Date(order.placedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-muted">
                        <span className="font-medium text-foreground">{order.items.length}</span> item{order.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-muted">•</span>
                      <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                      </span>
                      {order.expectedDeliveryDate && (
                        <>
                          <span className="text-muted">•</span>
                          <span className="text-muted flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted mb-1">Total</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <Link
                        href={`/orders/${order._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

