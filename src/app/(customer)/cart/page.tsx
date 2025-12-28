'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Trash2, Plus, Minus } from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { clearCartApi, removeFromCartApi, updateCartItemApi } from '@/services/cartApi';
import { setCartItems } from '@/store/redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { formatCurrency } from '@/utils/currency';
import { ApiClientError } from '@/lib/apiClient';

export default function CartPage() {
  // Cart sync is handled by CartSyncProvider in the layout, no need to call here
  // useCartSync(); // Removed - already handled in layout

  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const loading = useAppSelector((state) => state.cart.loading);
  const synced = useAppSelector((state) => state.cart.synced);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!accessToken || newQuantity < 1) {
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(productId));
    setError('');

    try {
      const response = await updateCartItemApi(
        {
          productId,
          qty: newQuantity,
        },
        accessToken,
      );

      if (response.items) {
        dispatch(setCartItems(response.items));
      }
    } catch (err) {
      console.error('Failed to update cart item', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Failed to update quantity. Please try again.';
      setError(message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!accessToken) {
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(productId));
    setError('');

    try {
      const response = await removeFromCartApi(productId, accessToken);

      if (response.items) {
        dispatch(setCartItems(response.items));
      }
    } catch (err) {
      console.error('Failed to remove cart item', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Failed to remove item. Please try again.';
      setError(message);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    if (!accessToken) {
      return;
    }

    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    setError('');

    try {
      const response = await clearCartApi(accessToken);

      if (response.items) {
        dispatch(setCartItems(response.items));
      }
    } catch (err) {
      console.error('Failed to clear cart', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Failed to clear cart. Please try again.';
      setError(message);
    }
  };

  // Show loading only if we haven't synced yet and are currently loading
  // If synced is true, we should show the cart (even if empty)
  if (loading && !synced) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted">Loading cart...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted mt-2">
            Review your items and proceed to checkout when ready.
          </p>
        </header>

        {error && (
          <div className="mb-6 bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted mb-6">Start adding products to your cart</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const isUpdating = updatingItems.has(item.productId);
                return (
                  <div
                    key={item.productId}
                    className="bg-surface rounded-xl border border-border p-6 shadow-sm"
                  >
                    <div className="flex gap-4">
                      {item.image && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                            <p className="text-sm text-muted">Vendor ID: {item.vendorId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={isUpdating}
                            className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="text-xs text-muted mb-1">Unit price</p>
                            <p className="text-lg font-semibold text-foreground">
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-xs text-muted">Quantity</p>
                            <div className="flex items-center gap-1 border border-border rounded-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(item.productId, item.quantity - 1)
                                }
                                disabled={
                                  isUpdating ||
                                  item.quantity <= (item.minOrderQty || 1)
                                }
                                className="p-2 text-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin inline" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(item.productId, item.quantity + 1)
                                }
                                disabled={isUpdating}
                                className="p-2 text-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted mb-1">Line total</p>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <p className="text-sm text-muted mb-4">
                  Taxes, logistics, and payment terms will be finalized during checkout.
                </p>

                <div className="flex items-center justify-between py-4 border-t border-b border-border mb-4">
                  <span className="text-base font-semibold text-foreground">Subtotal</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="w-full border border-border bg-surface text-foreground py-3 rounded-lg font-semibold hover:bg-muted/50 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}


