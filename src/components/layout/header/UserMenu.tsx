"use client";

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Package, Settings, User, ShoppingCart, Heart, Clock, Sparkles } from 'lucide-react';

import { logoutUser } from '@/services/authApi';
import { clearAuth } from '@/store/redux/slices/authSlice';
import { clearCart } from '@/store/redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { AuthUser } from '@/types/auth';
import { clearAuthSession } from '@/utils/authSession';

interface UserMenuProps {
  user: AuthUser | null;
}

export function UserMenu({ user: userProp }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get user from Redux store as fallback
  const userFromStore = useAppSelector((state) => state.auth.user);
  
  // Use prop user if available, otherwise fallback to Redux store
  const user = userProp || userFromStore;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If click is outside both the menu and the button, close it
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // compute dropdown position relative to viewport and update on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const btn = buttonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      // menu width (w-72 => 18rem => 288px), but keep it responsive to viewport
      const maxMenuWidth = 288;
      const availableWidth = Math.min(maxMenuWidth, window.innerWidth - 16);
      const left = Math.max(8, rect.right - availableWidth);
      const top = rect.bottom + 8; // small gap
      setCoords({ top, left, width: availableWidth });
    }

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      clearAuthSession();
      dispatch(clearAuth());
      dispatch(clearCart());
      router.replace('/auth/login');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 relative z-[60]">
        <Link
          href="/auth/login"
          onClick={() => {
            console.log('Login button clicked');
          }}
          className="px-4 py-2 text-primary border-2 border-primary rounded-lg font-semibold text-sm hover:bg-primary/10 transition-all duration-300 hover:shadow-md hover:border-primary/80 relative z-[60] cursor-pointer"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          onClick={() => {
            console.log('Sign Up button clicked');
          }}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 relative z-[60] cursor-pointer"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 z-10" ref={menuRef}>
      <button
        className="hidden md:flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-300 hover:bg-primary/5 group border border-transparent hover:border-primary/20"
        // onClick={() => setIsOpen((prev) => !prev)}
        onClick={() => router.push('/profile')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <User
            size={20}
            className="relative z-10 text-foreground/70 group-hover:text-primary transition-colors duration-300"
          />
        </div>
        <span className="text-[10px] font-semibold text-foreground/70 group-hover:text-primary transition-colors duration-300">
          Account
        </span>
      </button>

      <Link
        href="/profile"
        className="md:hidden flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all duration-300 hover:bg-primary/5 group border border-transparent hover:border-primary/20"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <User
            size={20}
            className="relative z-10 text-foreground/70 group-hover:text-primary transition-colors duration-300"
          />
        </div>
        <span className="text-[10px] font-semibold text-foreground/70 group-hover:text-primary transition-colors duration-300">
          Account
        </span>
      </Link>

      {isOpen && (
        <div className="absolute z-50 top-24 right-0 mt-2 w-72 bg-surface/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="relative px-4 py-3 bg-primary/5 border-b border-border/50">
            <div className="relative">
              <p className="font-bold text-foreground truncate text-sm">{user.name}</p>
              <p className="text-xs text-muted truncate mt-0.5">{user.email ?? user.phone ?? ''}</p>
            </div>
          </div>

          <ul className="py-2">
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm">My Profile</span>
              </Link>
            </li>
            <li>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Package size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm">My Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm">Shopping Cart</span>
              </Link>
            </li>
            <li>
              <Link
                href="/favorites"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Heart size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm">Favorites</span>
              </Link>
            </li>
            <li>
              <Link
                href="/history"
                className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200 group rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Clock size={16} className="text-primary" />
                </div>
                <span className="font-semibold text-sm">History</span>
              </Link>
            </li>
          </ul>

          <div className="border-t border-border/50 p-3 bg-danger/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-danger hover:bg-danger/10 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-md border border-danger/20 hover:border-danger/30"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
