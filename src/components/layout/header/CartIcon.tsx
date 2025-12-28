'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { useAppSelector } from '@/store/redux/store';

export function CartIcon() {
  const items = useAppSelector((state) => state.cart.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative group flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/20"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <ShoppingCart
          size={20}
          className="md:w-5 md:h-5 relative z-10 text-foreground/70 group-hover:text-primary transition-colors duration-300"
        />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[8px] font-bold rounded-full min-w-[1.25rem] h-4 flex items-center justify-center px-1 py-1 shadow-lg border-2 border-white z-20">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="hidden md:block text-[10px] font-semibold text-foreground/70 group-hover:text-primary transition-colors duration-300">
        Cart
        {itemCount > 0 && (
          <span className="ml-1 text-secondary font-bold">({itemCount})</span>
        )}
      </span>
    </Link>
  );
}
