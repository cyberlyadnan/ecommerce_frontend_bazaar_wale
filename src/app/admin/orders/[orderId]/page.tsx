'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  Calendar,
  Edit2,
  Store,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAppSelector } from '@/store/redux/store';
import { formatCurrency } from '@/utils/currency';
import { ApiClientError } from '@/lib/apiClient';
import {
  getAdminOrderById,
  updateOrderStatus,
  updateExpectedDeliveryDate,
  type Order,
} from '@/services/orderApi';

type AdminOrder = Order & {
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

const statusConfig: Record<
  Order['status'],
  { label: string; className: string; icon: any }
> = {
  created: {
    label: 'Processing',
    className: 'bg-amber-500/10 text-amber-600',
    icon: Clock,
  },
  vendor_shipped_to_warehouse: {
    label: 'Shipped to Warehouse',
    className: 'bg-purple-500/10 text-purple-600',
    icon: Truck,
  },
  received_in_warehouse: {
    label: 'Received in Warehouse',
    className: 'bg-indigo-500/10 text-indigo-600',
    icon: CheckCircle2,
  },
  packed: {
    label: 'Packed',
    className: 'bg-amber-500/10 text-amber-600',
    icon: Package,
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-cyan-500/10 text-cyan-600',
    icon: Truck,
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

const getStatusBadge = (status: Order['status']) => {
  const badge = statusConfig[status] || statusConfig.created;
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');
  const [editingDeliveryDate, setEditingDeliveryDate] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [updatingDeliveryDate, setUpdatingDeliveryDate] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!accessToken || !orderId) {
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminOrderById(orderId, accessToken);
        setOrder(response.order);
        setSelectedStatus(response.order.status);
        if (response.order.expectedDeliveryDate) {
          const date = new Date(response.order.expectedDeliveryDate);
          setDeliveryDate(date.toISOString().split('T')[0]);
        }
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

  const handleStatusUpdate = async () => {
    if (!accessToken || !order || !selectedStatus || selectedStatus === order.status) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const response = await updateOrderStatus(orderId, selectedStatus, accessToken);
      setOrder({ ...response.order, customer: order.customer });
      toast.success('Order status updated successfully');
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to update order status. Please try again.',
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeliveryDateUpdate = async () => {
    if (!accessToken || !order || !deliveryDate) {
      return;
    }

    setUpdatingDeliveryDate(true);

    try {
      const response = await updateExpectedDeliveryDate(
        orderId,
        deliveryDate,
        accessToken,
      );
      setOrder({ ...response.order, customer: order.customer });
      setEditingDeliveryDate(false);
      toast.success('Expected delivery date updated successfully');
    } catch (err) {
      console.error('Failed to update delivery date:', err);
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : 'Failed to update delivery date. Please try again.',
      );
    } finally {
      setUpdatingDeliveryDate(false);
    }
  };

  const getNextStatusOptions = (currentStatus: Order['status']): Order['status'][] => {
    switch (currentStatus) {
      case 'vendor_shipped_to_warehouse':
        return ['received_in_warehouse'];
      case 'received_in_warehouse':
        return ['packed'];
      case 'packed':
        return ['shipped'];
      case 'shipped':
        return ['delivered'];
      case 'created':
        return ['received_in_warehouse', 'packed', 'shipped', 'delivered', 'cancelled'];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
          {error || 'Order not found'}
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const nextStatusOptions = getNextStatusOptions(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
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

        {/* Status Update Section */}
        {nextStatusOptions.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
              disabled={updatingStatus}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value={order.status}>
                Current: {statusConfig[order.status]?.label || order.status}
              </option>
              {nextStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusConfig[status]?.label || status}
                </option>
              ))}
            </select>
            {selectedStatus !== order.status && (
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>
            {order.customer ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted mb-1">Name</p>
                  <p className="font-semibold text-foreground">{order.customer.name}</p>
                </div>
                {order.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted" />
                    <div>
                      <p className="text-sm text-muted mb-1">Email</p>
                      <p className="text-foreground">{order.customer.email}</p>
                    </div>
                  </div>
                )}
                {order.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted" />
                    <div>
                      <p className="text-sm text-muted mb-1">Phone</p>
                      <p className="text-foreground">{order.customer.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">Customer information not available</p>
            )}
          </div>

          {/* Vendor Information */}
          {order.vendors && order.vendors.length > 0 && (
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Vendor Information
              </h2>
              <div className="space-y-4">
                {order.vendors.map((vendor) => {
                  // Get items for this vendor
                  const vendorItems = order.items.filter(
                    (item) => item.vendorId === vendor._id,
                  );
                  const vendorTotal = vendorItems.reduce(
                    (sum, item) => sum + item.totalPrice,
                    0,
                  );

                  return (
                    <div
                      key={vendor._id}
                      className="border border-border rounded-lg p-4 bg-background/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {vendor.businessName || vendor.name}
                            </h3>
                            {vendor.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-semibold">
                                <Building2 size={12} />
                                Admin
                              </span>
                            )}
                            {vendor.role === 'vendor' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold">
                                <Store size={12} />
                                Vendor
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            {vendor.email && (
                              <div className="flex items-center gap-2 text-muted">
                                <Mail className="w-4 h-4" />
                                <span>{vendor.email}</span>
                              </div>
                            )}
                            {vendor.phone && (
                              <div className="flex items-center gap-2 text-muted">
                                <Phone className="w-4 h-4" />
                                <span>{vendor.phone}</span>
                              </div>
                            )}
                            {vendor.gstNumber && (
                              <div className="flex items-center gap-2 text-muted">
                                <span className="font-medium">GST:</span>
                                <span>{vendor.gstNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted mb-1">
                            {vendorItems.length} item{vendorItems.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(vendorTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                    {item.vendorSnapshot.vendorPhone && (
                      <p className="text-sm text-muted">
                        Vendor Phone: {item.vendorSnapshot.vendorPhone}
                      </p>
                    )}
                    <p className="text-sm text-muted mt-1">
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
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-sm text-foreground">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-muted">{order.shippingAddress.phone}</p>
              <p className="mt-2">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
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

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm sticky top-24 space-y-6">
            {/* Order Summary */}
            <div>
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
            </div>

            {/* Payment Information */}
            {order.razorpayPaymentId && (
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  {order.razorpayOrderId && (
                    <div>
                      <p className="text-muted mb-1">Razorpay Order ID</p>
                      <p className="font-mono text-xs text-foreground break-all">
                        {order.razorpayOrderId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted mb-1">Payment ID</p>
                    <p className="font-mono text-xs text-foreground break-all">
                      {order.razorpayPaymentId}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expected Delivery Date */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expected Delivery
                </h3>
                {!editingDeliveryDate && (
                  <button
                    onClick={() => setEditingDeliveryDate(true)}
                    className="p-1 text-muted hover:text-foreground transition"
                    title="Edit delivery date"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              {editingDeliveryDate ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={updatingDeliveryDate}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeliveryDateUpdate}
                      disabled={updatingDeliveryDate || !deliveryDate}
                      className="flex-1 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      {updatingDeliveryDate ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDeliveryDate(false);
                        if (order.expectedDeliveryDate) {
                          const date = new Date(order.expectedDeliveryDate);
                          setDeliveryDate(date.toISOString().split('T')[0]);
                        }
                      }}
                      disabled={updatingDeliveryDate}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  {order.expectedDeliveryDate ? (
                    <p className="text-foreground font-medium">
                      {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  ) : (
                    <p className="text-muted">Not set</p>
                  )}
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Order Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted mb-1">Order Placed</p>
                  <p className="text-foreground">
                    {new Date(order.placedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {order.shippedDate && (
                  <div>
                    <p className="text-muted mb-1">Shipped Date</p>
                    <p className="text-foreground">
                      {new Date(order.shippedDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted mb-1">Last Updated</p>
                  <p className="text-foreground">
                    {new Date(order.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

