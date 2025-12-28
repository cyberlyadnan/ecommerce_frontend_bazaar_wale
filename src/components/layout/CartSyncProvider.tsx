'use client';

import { useCartSync } from '@/hooks/useCartSync';

/**
 * Client component wrapper for cart synchronization
 * This allows us to use the cart sync hook without making the parent a client component
 */
export function CartSyncProvider() {
  useCartSync();
  return null;
}

