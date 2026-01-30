'use client';

import { useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  Loader2,
  Eye,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAppSelector } from '@/store/redux/store';
import {
  getAdminOrders,
  updateOrderStatus,
  type Order,
} from '@/services/orderApi';
import { ApiClientError } from '@/lib/apiClient';
import { Pagination } from '@/components/shared/Pagination';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

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

type AdminOrder = Order & {
  customer?: { name: string; email?: string; phone?: string };
  vendors?: Array<{
    _id: string;
    name: string;
    businessName?: string;
    gstNumber?: string;
    role: string;
  }>;
};

export default function AdminOrdersPage() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<Record<string, Order['status']>>({});
  const [filter, setFilter] = useState<'all' | 'admin_only'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [filter, statusFilter, debouncedSearch]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAdminOrders(
          accessToken,
          filter,
          statusFilter !== 'all' ? statusFilter : undefined,
          debouncedSearch || undefined,
          { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE },
        );
        setOrders(response.orders || []);
        setTotal(response.total ?? 0);
      } catch (err) {
        console.error('Failed to fetch admin orders:', err);
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
  }, [accessToken, filter, statusFilter, debouncedSearch, page]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!accessToken) {
      return;
    }

    setUpdatingStatus((prev) => new Set(prev).add(orderId));

    try {
      const response = await updateOrderStatus(orderId, newStatus, accessToken);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...response.order, customer: order.customer } : order,
        ),
      );
      setSelectedStatus((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
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
          <p className="text-sm text-muted">Loading orders...</p>
        </div>
      </div>
    );
  }

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'created', label: 'Processing' },
    { value: 'vendor_shipped_to_warehouse', label: 'Shipped to Warehouse' },
    { value: 'received_in_warehouse', label: 'Received in Warehouse' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders Management</h1>
          <p className="text-sm text-muted">
            Manage all orders, track fulfillment, and update order statuses. Mark orders as received
            from vendors and manage shipping to customers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by order ID, vendor name, or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-col gap-4">
          {/* Order Type Filter */}
          <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
            <span className="text-sm font-medium text-muted whitespace-nowrap flex items-center gap-2">
              <Filter size={16} />
              Order Type:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  filter === 'all'
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-foreground'
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setFilter('admin_only')}
                className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                  filter === 'admin_only'
                    ? 'text-primary border-primary'
                    : 'text-muted border-transparent hover:text-foreground'
                }`}
              >
                Admin Orders
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted whitespace-nowrap flex items-center gap-2">
              <Package size={16} />
              Status:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilters.map((status) => {
                const config = statusConfig[status.value as Order['status']] || null;
                return (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      statusFilter === status.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {config ? (
                      <span className="flex items-center gap-1">
                        {config.icon}
                        {status.label}
                      </span>
                    ) : (
                      status.label
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Results Count */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Showing <span className="font-semibold text-foreground">{orders.length}</span> of <span className="font-semibold text-foreground">{total}</span> order{total !== 1 ? 's' : ''}
            {searchQuery && (
              <span> for &quot;<span className="font-semibold text-foreground">{searchQuery}</span>&quot;</span>
            )}
          </span>
          {(filter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-primary hover:text-primary/80 font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {orders.length === 0 && !loading ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery || filter !== 'all' || statusFilter !== 'all'
              ? 'No orders found'
              : 'No orders yet'}
          </h3>
          <p className="text-muted">
            {searchQuery || filter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Orders will appear here once customers place them'}
          </p>
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="min-w-full divide-y divide-border/70 text-sm hidden md:table">
              <thead className="bg-muted/20 text-muted">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Order</th>
                  <th className="px-5 py-3 text-left font-medium">Vendor</th>
                  <th className="px-5 py-3 text-left font-medium">Items</th>
                  <th className="px-5 py-3 text-left font-medium">Total</th>
                  <th className="px-5 py-3 text-left font-medium">Payment</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.created;
                  const nextStatusOptions = getNextStatusOptions(order.status);
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
                        {order.vendors && order.vendors.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {order.vendors.map((vendor, idx) => (
                              <div key={vendor._id} className={idx > 0 ? 'mt-2 pt-2 border-t border-border/30' : ''}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {vendor.businessName || vendor.name}
                                  </span>
                                  {vendor.role === 'admin' && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-semibold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                {vendor.gstNumber && (
                                  <span className="text-xs text-muted">GST: {vendor.gstNumber}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
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
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {nextStatusOptions.length > 0 && (
                            <select
                              value={selectedStatus[order._id] || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  setSelectedStatus((prev) => ({
                                    ...prev,
                                    [order._id]: e.target.value as Order['status'],
                                  }));
                                }
                              }}
                              disabled={isUpdating}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                              <option value="">Update status...</option>
                              {nextStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {statusConfig[status]?.label || status}
                                </option>
                              ))}
                            </select>
                          )}
                          {selectedStatus[order._id] && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(order._id, selectedStatus[order._id]!)
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Update'
                              )}
                            </button>
                          )}
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition inline-flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/60">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.created;
                const nextStatusOptions = getNextStatusOptions(order.status);
                const isUpdating = updatingStatus.has(order._id);

                return (
                  <div key={order._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                        <p className="text-xs text-muted mt-1">
                          {new Date(order.placedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.badgeClass}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                    </div>

                    {/* Vendor Info */}
                    {order.vendors && order.vendors.length > 0 && (
                      <div className="space-y-2">
                        {order.vendors.map((vendor) => (
                          <div key={vendor._id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {vendor.businessName || vendor.name}
                              </span>
                              {vendor.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-semibold">
                                  Admin
                                </span>
                              )}
                            </div>
                            {vendor.gstNumber && (
                              <span className="text-xs text-muted">GST: {vendor.gstNumber}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted text-xs">Items</p>
                        <p className="font-medium text-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted text-xs">Total</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted text-xs">Payment</p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                      {order.expectedDeliveryDate && (
                        <div>
                          <p className="text-muted text-xs">Delivery</p>
                          <p className="text-xs text-foreground flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
                      {nextStatusOptions.length > 0 && (
                        <div className="flex gap-2">
                          <select
                            value={selectedStatus[order._id] || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                setSelectedStatus((prev) => ({
                                  ...prev,
                                  [order._id]: e.target.value as Order['status'],
                                }));
                              }
                            }}
                            disabled={isUpdating}
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          >
                            <option value="">Update status...</option>
                            {nextStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {statusConfig[status]?.label || status}
                              </option>
                            ))}
                          </select>
                          {selectedStatus[order._id] && (
                            <button
                              onClick={() =>
                                handleStatusUpdate(order._id, selectedStatus[order._id]!)
                              }
                              disabled={isUpdating}
                              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                'Update'
                              )}
                            </button>
                          )}
                        </div>
                      )}
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/40 transition inline-flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {orders.length > 0 && (
            <Pagination
              page={page}
              totalPages={Math.ceil(total / PAGE_SIZE) || 1}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={setPage}
              loading={loading}
            />
          )}
        </section>
      )}
    </div>
  );
}

