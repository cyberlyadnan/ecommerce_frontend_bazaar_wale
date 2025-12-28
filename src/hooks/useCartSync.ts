'use client';

import { useEffect, useRef } from 'react';

import { getCart } from '@/services/cartApi';
import { setCartItems, setLoading, resetSync } from '@/store/redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { ApiClientError } from '@/lib/apiClient';

/**
 * Hook to sync cart with backend on mount and when user/auth changes
 */
export function useCartSync() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);
  const synced = useAppSelector((state) => state.cart.synced);
  const loading = useAppSelector((state) => state.cart.loading);
  
  // Use ref to track if sync is in progress to prevent multiple simultaneous requests
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // Only sync if user is logged in and cart hasn't been synced yet
    if (!accessToken || !user || synced || loading || isSyncingRef.current) {
      return;
    }

    const syncCart = async () => {
      isSyncingRef.current = true;
      dispatch(setLoading(true));
      try {
        const response = await getCart(accessToken);
        // Always set cart items, even if empty array
        dispatch(setCartItems(response.items || []));
      } catch (error) {
        console.error('Failed to sync cart', error);
        
        // Handle different error cases
        if (error instanceof ApiClientError) {
          if (error.status === 404) {
            // Cart doesn't exist yet, set empty cart
            dispatch(setCartItems([]));
          } else if (error.status === 401 || error.status === 403) {
            // Auth error - don't mark as synced so it can retry after re-auth
            console.warn('Cart sync failed due to auth error');
            dispatch(setCartItems([]));
          } else if (error.status === 429) {
            // Rate limit - don't mark as synced, allow retry
            console.warn('Cart sync rate limited');
          } else {
            // Other errors - set empty cart and mark as synced to prevent infinite retries
            dispatch(setCartItems([]));
          }
        } else {
          // Unknown error - set empty cart
          dispatch(setCartItems([]));
        }
      } finally {
        dispatch(setLoading(false));
        isSyncingRef.current = false;
      }
    };

    syncCart();
  }, [accessToken, user, synced, dispatch]); // Removed 'loading' from dependencies

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!user) {
      dispatch(resetSync());
      isSyncingRef.current = false;
    }
  }, [user, dispatch]);
}

