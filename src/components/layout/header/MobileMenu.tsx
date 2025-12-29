// components/Header/MobileMenu.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X, ChevronRight, Sparkles, Search, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthUser } from '@/types/auth';
import { useAppSelector } from '@/store/redux/store';

interface MobileMenuProps {
  navLinks: Array<{ label: string; href: string }>;
  user: AuthUser | null;
  showBecomeVendor: boolean;
}

export function MobileMenu({ navLinks, user, showBecomeVendor }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Prevent body scroll when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSidebar = () => {
    console.log('Toggle Sidebar called');
    setIsOpen((prev) => {
      const newValue = !prev;
      console.log('Sidebar toggle:', newValue);
      return newValue;
    });
    setShowSearch(false);
  };

  // Prevent rendering sidebar until mounted (SSR safety)
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-foreground/70" aria-label="Search">
          <Search size={22} />
        </button>
        <Link href="/cart" className="relative p-2 rounded-lg text-foreground/70" aria-label="Cart">
          <ShoppingCart size={22} />
        </Link>
        <button className="p-2 rounded-lg text-foreground/70" aria-label="Menu">
          <Menu size={24} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Right Side Icons - Mobile Only */}
      <div className="flex items-center gap-2">
        {/* Search Icon */}
        <button
          type="button"
          className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
          onClick={() => {
            setShowSearch(!showSearch);
            setIsOpen(false);
          }}
          aria-label="Toggle search"
        >
          <Search size={22} />
        </button>

        {/* Cart Icon */}
        <Link
          href="/cart"
          className="relative p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
          aria-label="Shopping cart"
        >
          <ShoppingCart size={22} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 shadow-lg border-2 border-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        {/* Menu Icon */}
        <button
          type="button"
          className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
          }}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Search Bar - Toggleable */}
      {showSearch &&
        mounted &&
        createPortal(
          <div
            className="fixed top-20 left-0 right-0 z-[10000] md:hidden border-b border-border/50 bg-surface/95 backdrop-blur-sm py-3 px-4 shadow-lg"
            style={{ animation: 'slideDown 0.2s ease-in-out' }}
          >
            <form className="relative group" onSubmit={handleSearch}>
              <div className="relative flex items-center">
                {/* Search Icon */}
                <div className="absolute left-3 z-10">
                  <div className="p-1.5 rounded-lg bg-primary/5 group-focus-within:bg-primary/10 transition-colors">
                    <Search className="w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                {/* Search Input */}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-2.5 bg-surface border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm text-foreground placeholder:text-muted shadow-sm hover:shadow-md hover:border-border focus:shadow-lg backdrop-blur-sm"
                  aria-label="Search products"
                  autoFocus
                />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-2 p-2 text-muted hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}

      {/* Sidebar Menu */}
      {isOpen && mounted &&
        typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[10000] md:hidden" style={{ pointerEvents: 'auto' }}>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={toggleSidebar}
              style={{ animation: 'fadeIn 0.2s ease-in-out' }}
              aria-hidden="true"
            />

            {/* Sidebar Panel - Opens from Right */}
            <div
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface/95 backdrop-blur-xl overflow-y-auto shadow-2xl border-l border-border/50"
              style={{ 
                animation: 'slideInFromRight 0.3s ease-in-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-6">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-xl border border-border/50">
                    <p className="font-bold text-foreground text-base">{user.name}</p>
                    <p className="text-sm text-muted capitalize mt-1">{user.role}</p>
                  </div>
                )}

                {/* Navigation Links */}
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group"
                        onClick={toggleSidebar}
                      >
                        <span>{link.label}</span>
                        <ChevronRight
                          size={20}
                          className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}

                  {/* Become a Vendor Button */}
                  {showBecomeVendor && (
                    <li className="mt-2">
                      <Link
                        href="/auth/register/vendor"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={toggleSidebar}
                      >
                        <Sparkles className="w-4 h-4" />
                        Become a Vendor
                      </Link>
                    </li>
                  )}

                  {/* Login/Signup or User Menu */}
                  {user ? (
                    <>
                      <li className="mt-4 pt-4 border-t border-border/50">
                        <Link
                          href="/orders"
                          className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group"
                          onClick={toggleSidebar}
                        >
                          <span>My Orders</span>
                          <ChevronRight
                            size={20}
                            className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group"
                          onClick={toggleSidebar}
                        >
                          <span>Profile</span>
                          <ChevronRight
                            size={20}
                            className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                          />
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="mt-4 pt-4 border-t border-border/50">
                        <Link
                          href="/auth/login"
                          className="flex items-center justify-center px-4 py-3 text-primary border-2 border-primary hover:bg-primary/10 rounded-lg font-semibold transition-all duration-300"
                          onClick={toggleSidebar}
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/auth/register"
                          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                          onClick={toggleSidebar}
                        >
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
