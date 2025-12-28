'use client';

import { useEffect, useState, type ReactElement } from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  Store,
  DollarSign,
  ShoppingCart,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAppSelector } from '@/store/redux/store';
import {
  getVendorOrders,
  updateOrderStatus,
  type Order,
} from '@/services/orderApi';
import { ApiClientError } from '@/lib/apiClient';
import { formatCurrency } from '@/utils/currency';

const statusConfig: Record<
  Order['status'],
  { icon: ReactElement; badgeClass: string; label: string }
> = {
  created: {
    icon: <Clock size={12} />,
    badgeClass: 'bg-amber-500/10 text-amber-600',
    label: 'Processing',
  },
  vendor_shipped_to_warehouse: {
    icon: <Truck size={12} />,
    badgeClass: 'bg-purple-500/10 text-purple-600',
    label: 'Shipped to Warehouse',
  },
  received_in_warehouse: {
    icon: <CheckCircle2 size={12} />,
    badgeClass: 'bg-indigo-500/10 text-indigo-600',
    label: 'Received in Warehouse',
  },
  packed: {
    icon: <CheckCircle2 size={12} />,
    badgeClass: 'bg-amber-500/10 text-amber-600',
    label: 'Packed',
  },
  shipped: {
    icon: <Truck size={12} />,
    badgeClass: 'bg-cyan-500/10 text-cyan-600',
    label: 'Shipped',
  },
  delivered: {
    icon: <CheckCircle2 size={12} />,
    badgeClass: 'bg-emerald-500/10 text-emerald-600',
    label: 'Delivered',
  },
  cancelled: {
    icon: <XCircle size={12} />,
    badgeClass: 'bg-rose-500/10 text-rose-600',
    label: 'Cancelled',
  },
};

export default function VendorOrdersPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getVendorOrders(accessToken);
        setOrders(response.orders || []);
      } catch (err) {
        console.error('Failed to fetch vendor orders:', err);
        toast.error(
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

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order['status'],
  ) => {
    if (!accessToken) {
      return;
    }

    setUpdatingStatus((prev) => new Set(prev).add(orderId));

    try {
      const response = await updateOrderStatus(orderId, newStatus, accessToken);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? response.order : order,
        ),
      );
      toast.success('Order status updated successfully');
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to update order status. Please try again.',
      );
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const canUpdateStatus = (order: Order) => {
    return (
      order.status === 'created' &&
      order.paymentStatus === 'paid' &&
      !updatingStatus.has(order._id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-sm text-muted">
          Manage your orders and update their status. Customer details are kept confidential.
        </p>
      </header>

      {/* Vendor Info Card */}
      {user && (
        <div className="bg-surface rounded-xl border border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {user.businessName || user.name}
              </h3>
              <p className="text-sm text-muted">Your Vendor Account</p>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No orders yet
          </h3>
          <p className="text-muted">
            Orders containing your products will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-muted/20 text-muted">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Order</th>
                  <th className="px-5 py-3 text-left font-medium">Products</th>
                  <th className="px-5 py-3 text-left font-medium">Quantity</th>
                  <th className="px-5 py-3 text-left font-medium">Value</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.created;
                  const canUpdate = canUpdateStatus(order);
                  const isUpdating = updatingStatus.has(order._id);

                  return (
                    <tr key={order._id} className="hover:bg-muted/10">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs text-muted">
                            {new Date(order.placedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium text-foreground">{item.title}</p>
                              {item.sku && (
                                <p className="text-xs text-muted">SKU: {item.sku}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {order.items.reduce((sum, item) => sum + item.qty, 0)} total
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(order.total)}
                          </span>
                          <span className="text-xs text-muted">
                            {formatCurrency(order.subtotal)} + {formatCurrency(order.tax)} tax
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
                          >
                            {config.icon}
                            {config.label}
                          </span>
                          {order.expectedDeliveryDate && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {canUpdate ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  order._id,
                                  'vendor_shipped_to_warehouse',
                                )
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Truck size={14} />
                                  Ship to Warehouse
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(order._id, 'cancelled')
                              }
                              disabled={isUpdating}
                              className="rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              <XCircle size={14} />
                              Cancel/Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">No action available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.created;
              const canUpdate = canUpdateStatus(order);
              const isUpdating = updatingStatus.has(order._id);
              const isExpanded = expandedOrders.has(order._id);
              const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

              return (
                <div
                  key={order._id}
                  className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {order.orderNumber}
                        </h3>
                        <p className="text-xs text-muted mb-2">
                          {new Date(order.placedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.badgeClass}`}
                          >
                            {config.icon}
                            {config.label}
                          </span>
                          {order.expectedDeliveryDate && (
                            <span className="text-xs text-muted flex items-center gap-1">
                              <Calendar size={12} />
                              Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-2 text-muted hover:text-foreground transition"
                      >
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Summary */}
                  <div className="p-4 grid grid-cols-2 gap-4 border-b border-border">
                    <div>
                      <p className="text-xs text-muted mb-1">Items</p>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <ShoppingCart size={14} />
                        {order.items.length} product{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {totalQty} total qty
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Total Value</p>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <DollarSign size={14} />
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {formatCurrency(order.subtotal)} + tax
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 border-b border-border bg-muted/5">
                      {/* Product Details */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Product Details
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-background rounded-lg p-3 border border-border"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-medium text-foreground text-sm">
                                    {item.title}
                                  </p>
                                  {item.sku && (
                                    <p className="text-xs text-muted mt-1">
                                      SKU: {item.sku}
                                    </p>
                                  )}
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                    <span className="text-muted">
                                      Qty: <span className="font-medium text-foreground">{item.qty}</span>
                                    </span>
                                    <span className="text-muted">
                                      Price: <span className="font-medium text-foreground">{formatCurrency(item.pricePerUnit)}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-foreground">
                                    {formatCurrency(item.totalPrice)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Order Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted">Subtotal</span>
                            <span className="text-foreground">
                              {formatCurrency(order.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Tax (GST)</span>
                            <span className="text-foreground">
                              {formatCurrency(order.tax)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-border font-semibold">
                            <span className="text-foreground">Total</span>
                            <span className="text-primary">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expected Delivery Date */}
                      {order.expectedDeliveryDate && (
                        <div className="bg-background rounded-lg p-3 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted" />
                            <h4 className="text-sm font-semibold text-foreground">
                              Expected Delivery
                            </h4>
                          </div>
                          <p className="text-sm text-foreground">
                            {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {canUpdate && (
                    <div className="p-4 space-y-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(order._id, 'vendor_shipped_to_warehouse')
                        }
                        disabled={isUpdating}
                        className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Truck size={16} />
                            Ship to Warehouse
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        disabled={isUpdating}
                        className="w-full rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 px-4 py-2.5 text-sm font-semibold hover:bg-rose-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Cancel/Reject Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
