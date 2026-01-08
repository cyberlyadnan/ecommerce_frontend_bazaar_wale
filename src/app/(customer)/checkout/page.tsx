'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppSelector } from '@/store/redux/store';
import { formatCurrency } from '@/utils/currency';
import { ApiClientError } from '@/lib/apiClient';
import {
  calculateOrderTotals,
  createOrder,
  verifyPayment,
  type ShippingAddress,
  type OrderCalculation,
  type RazorpayOrder,
} from '@/services/orderApi';
import { setCartItems } from '@/store/redux/slices/cartSlice';
import { useAppDispatch } from '@/store/redux/store';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { Address } from '@/services/addressApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutFormData {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [calculation, setCalculation] = useState<OrderCalculation | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useManualEntry, setUseManualEntry] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      country: 'India',
    },
  });

  // Calculate order totals on mount
  useEffect(() => {
    // Don't redirect if we're already processing an order
    if (orderCreated) {
      return;
    }
    
    if (!accessToken || cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    const fetchCalculation = async () => {
      try {
        setCalculating(true);
        const response = await calculateOrderTotals(accessToken);
        setCalculation(response.calculation);
      } catch (error) {
        console.error('Failed to calculate order totals:', error);
        toast.error(
          error instanceof ApiClientError
            ? error.message
            : 'Failed to calculate order totals',
        );
        router.push('/thank-you?error=true');
      } finally {
        setCalculating(false);
      }
    };
    fetchCalculation();
  }, [accessToken, cartItems.length, router, orderCreated]);
  
  useEffect(() => {
    if (errors.name?.message) {
      toast.error(errors.name.message);
    }
  }, [errors.name]);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!accessToken || !calculation || !razorpayLoaded) {
      return;
    }

    // Validate that either a saved address is selected or manual entry is filled
    if (!selectedAddress && !useManualEntry) {
      toast.error('Please select a saved address or fill in the address form');
      return;
    }

    try {
      setLoading(true);

      // Use selected address if available, otherwise use form data
      const shippingAddress: ShippingAddress = selectedAddress
        ? {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            country: selectedAddress.country || 'India',
            postalCode: selectedAddress.postalCode,
          }
        : {
            name: data.name,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 || undefined,
            city: data.city,
            state: data.state,
            country: data.country || 'India',
            postalCode: data.postalCode,
          };

      const orderResponse = await createOrder(shippingAddress, accessToken);
      setCurrentOrder(orderResponse.order);
      setOrderCreated(true);

      // Initialize Razorpay payment
      const razorpayOrder: RazorpayOrder = orderResponse.razorpayOrder;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Bazaarwale',
        description: `Order ${orderResponse.order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            setLoading(true);

            // Verify payment on backend
            const verifyResponse = await verifyPayment(
              orderResponse.order._id,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              accessToken,
            );

            // Clear cart
            dispatch(setCartItems([]));

            // Redirect to thank you page immediately
            router.replace(`/thank-you?order=${orderResponse.order.orderNumber}&status=success`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(
              error instanceof ApiClientError
                ? error.message
                : 'Payment verification failed. Please contact support.',
            );
            // Still redirect to thank you page, but show error message
            router.replace(`/thank-you?order=${orderResponse.order.orderNumber}&error=true`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
          email: '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
            router.replace(`/thank-you?order=${orderResponse.order.orderNumber}&cancelled=true`);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to create order. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (calculating) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted">Calculating order totals...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!calculation) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
            Unable to calculate order totals. Please try again.
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (cartItems.length === 0) {
    return (
      <AuthGuard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-surface rounded-xl border border-border p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted mb-6">
              Add items to your cart before checkout
            </p>
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          toast.error('Failed to load payment gateway');
          setRazorpayLoaded(false);
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted mt-2">
            Complete your order by providing shipping details and payment
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Shipping Address Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Shipping Address
                </h2>

                {/* Address Selector */}
                {!useManualEntry && accessToken && (
                  <div className="mb-6">
                    <AddressSelector
                      selectedAddress={selectedAddress}
                      onSelectAddress={(address) => {
                        setSelectedAddress(address);
                        setUseManualEntry(false);
                        // Populate form with selected address values for fallback
                        if (address) {
                          reset({
                            name: address.name,
                            phone: address.phone,
                            line1: address.line1,
                            line2: address.line2 || '',
                            city: address.city,
                            state: address.state,
                            country: address.country || 'India',
                            postalCode: address.postalCode,
                          });
                        }
                      }}
                      accessToken={accessToken}
                    />
                    <div className="mt-4 pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setUseManualEntry(true);
                          setSelectedAddress(null);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Or enter a new address manually
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Entry Form */}
                {useManualEntry && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted">Enter address manually</p>
                      <button
                        type="button"
                        onClick={() => {
                          setUseManualEntry(false);
                          // Keep selected address if available
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Use saved address instead
                      </button>
                    </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', {
                        required: useManualEntry ? 'Name is required' : false,
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-danger">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone', {
                        required: useManualEntry ? 'Phone number is required' : false,
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Invalid phone number',
                        },
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-danger">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="line1"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      id="line1"
                      {...register('line1', {
                        required: useManualEntry ? 'Address line 1 is required' : false,
                      })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      placeholder="Street address, P.O. box"
                    />
                    {errors.line1 && (
                      <p className="mt-1 text-sm text-danger">
                        {errors.line1.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="line2"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="line2"
                      {...register('line2')}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        {...register('city', {
                          required: useManualEntry ? 'City is required' : false,
                        })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-danger">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        {...register('state', {
                          required: useManualEntry ? 'State is required' : false,
                        })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-danger">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        {...register('postalCode', {
                          required: useManualEntry ? 'Postal code is required' : false,
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Invalid postal code (must be 6 digits)',
                          },
                        })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="6-digit postal code"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-danger">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Country *
                      </label>
                      <input
                        type="text"
                        id="country"
                        {...register('country', {
                          required: useManualEntry ? 'Country is required' : false,
                        })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="Country"
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-danger">
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <aside className="lg:col-span-1">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {calculation.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted">
                        {item.title} × {item.qty}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-foreground">
                      {formatCurrency(calculation.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="text-foreground">
                      {formatCurrency(calculation.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tax (GST)</span>
                    <span className="text-foreground">
                      {formatCurrency(calculation.tax)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-border mb-4">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(calculation.total)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !razorpayLoaded || orderCreated || (!selectedAddress && !useManualEntry)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : orderCreated ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Order Created
                    </>
                  ) : !razorpayLoaded ? (
                    'Loading Payment Gateway...'
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>

                {!razorpayLoaded && (
                  <p className="mt-2 text-xs text-muted text-center">
                    Please wait while we load the payment gateway...
                  </p>
                )}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}

