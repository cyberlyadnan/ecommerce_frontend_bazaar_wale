// ========================================
// components/AddToCartButton.tsx
// ========================================

'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

import { addToCartApi } from '@/services/cartApi';
import { setCartItems } from '@/store/redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';

interface AddToCartButtonProps {
  productId: string;
  minOrderQty: number;
  stock: number;
  isActive: boolean;
  className?: string;
}

export function AddToCartButton({
  productId,
  minOrderQty,
  stock,
  isActive,
  className = '',
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(minOrderQty);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Use ref to prevent multiple simultaneous requests
  const isRequestInProgress = useRef(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  const handleAddToCart = async () => {
    // If user is not logged in, redirect to login page with return URL
    if (!accessToken || !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    // Prevent multiple simultaneous requests
    if (isRequestInProgress.current || isLoading) {
      return;
    }

    isRequestInProgress.current = true;
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await addToCartApi(
        {
          productId,
          qty: quantity,
        },
        accessToken,
      );

      // Update Redux store with backend cart data
      if (response.items) {
        dispatch(setCartItems(response.items));
      }

      setMessage({ type: 'success', text: `Added ${quantity} item(s) to cart!` });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : 'Failed to add to cart. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  };

  const isDisabled = !isActive || stock === 0 || isLoading || quantity < minOrderQty;

  return (
    <div className="space-y-1.5">
      {message && (
        <div
          className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            message.type === 'success'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="flex items-center gap-1.5">
        {stock > 0 && (
          <div className="flex items-center gap-0.5 border border-border/50 rounded-lg bg-background/50 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(minOrderQty, prev - 1))}
              disabled={isLoading || quantity <= minOrderQty}
              className="px-2 py-1.5 text-xs text-muted hover:text-foreground hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
            >
              −
            </button>
            <span className="px-2 py-1.5 text-xs font-bold min-w-[2rem] text-center border-x border-border/50">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
              disabled={isLoading || quantity >= stock}
              className="px-2 py-1.5 text-xs text-muted hover:text-foreground hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
            >
              +
            </button>
          </div>
        )}
        
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`${className} flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
              <span className="sm:hidden">
                {stock === 0 ? 'Out' : 'Add'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}