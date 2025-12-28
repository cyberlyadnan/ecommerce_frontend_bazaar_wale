'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Mail } from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(4);
  const orderNumber = searchParams.get('order');
  const hasError = searchParams.get('error') === 'true';
  const isCancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              {hasError || isCancelled ? (
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-amber-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
              )}
            </div>

            {/* Main Message */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {hasError
                ? 'Payment Verification Issue'
                : isCancelled
                  ? 'Payment Cancelled'
                  : 'Thank You for Your Order!'}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {hasError
                ? 'There was an issue verifying your payment. Our team will review and contact you shortly.'
                : isCancelled
                  ? 'Your payment was cancelled. The order has been created but payment is pending.'
                  : 'Your order has been confirmed and payment has been received.'}
            </p>

            {orderNumber && (
              <div className="mt-6 mb-8">
                <p className="text-sm text-gray-500 mb-2">Order Number</p>
                <p className="text-2xl font-bold text-indigo-600 font-mono">
                  {orderNumber}
                </p>
              </div>
            )}

            {/* Info Cards */}
            {!hasError && !isCancelled && (
              <div className="grid sm:grid-cols-2 gap-4 mt-8 mb-8">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <Package className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Order Confirmed
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've received your order and will process it shortly.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Email Sent
                  </h3>
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to your registered email
                    address.
                  </p>
                </div>
              </div>
            )}

            {/* Redirect Message */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Redirecting to home page in{' '}
                <span className="font-semibold text-indigo-600">{countdown}</span>{' '}
                second{countdown !== 1 ? 's' : ''}...
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold text-sm underline"
              >
                Go to Home Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

