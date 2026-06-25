// components/Header/MobileMenu.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X, ChevronRight, Sparkles, Search, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthUser } from '@/types/auth';
import { getWholesaleWhatsAppHref } from '@/lib/whatsapp';
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
  const whatsappHref = getWholesaleWhatsAppHref();

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
    setIsOpen((prev) => !prev);
    setShowSearch(false);
  };

  const toggleSearch = () => {
    console.log('toggleSearch');
    setShowSearch((prev) => !prev);
    setIsOpen(false);
  };

  // Render icons immediately (no SSR blocking)
  const icons = (
    <div className="flex items-center gap-2">
      {/* Search Icon */}
      <button
        type="button"
        className="p-2 z-10 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-300 touch-manipulation"
        onClick={toggleSearch}
        aria-label="Toggle search"
      >
        <Search size={22} />
      </button>

      {/* Cart Icon */}
      <Link
        href="/cart"
        className="relative p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 touch-manipulation"
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
        className="p-2 z-10 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-300 touch-manipulation"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );

  // Only render portals after mount
  if (!mounted) {
    return icons;
  }

  return (
    <>
      {icons}

      {/* Mobile Search Bar - Toggleable */}
      {showSearch &&
        typeof window !== 'undefined' &&
        document?.body &&
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
                  onClick={toggleSearch}
                  className="absolute right-2 p-2 text-muted hover:text-foreground transition-colors touch-manipulation"
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
      {isOpen &&
        typeof window !== 'undefined' &&
        document?.body &&
        createPortal(
          <div className="fixed inset-0 z-[10000] md:hidden" style={{ pointerEvents: 'auto' }}>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={toggleSidebar}
              onTouchEnd={toggleSidebar}
              style={{ animation: 'fadeIn 0.2s ease-in-out' }}
              aria-hidden="true"
            />

            {/* Sidebar Panel - Opens from Right */}
            <div
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface/95 backdrop-blur-xl overflow-y-auto shadow-2xl border-l border-border/50"
              style={{ animation: 'slideInFromRight 0.3s ease-in-out' }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <nav className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-6">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-300 touch-manipulation"
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
                        className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group touch-manipulation"
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
                  {/* For Wholesale - WhatsApp */}
                  <li className="mt-2">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg touch-manipulation"
                      onClick={toggleSidebar}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M20.52 3.48A11.3 11.3 0 0012.01 0C5.37 0 .17 5.2.17 11.84c0 2.08.54 4.12 1.57 5.92L0 24l6.46-1.69A11.8 11.8 0 0011.97 24h.01c6.64 0 11.84-5.2 11.84-11.84 0-3.17-1.24-6.14-3.3-8.49zM12 21.5c-1.2 0-2.38-.32-3.4-.93l-.24-.14-3.83 1.01 1.02-3.73-.16-.27A8.7 8.7 0 013.5 11.84C3.5 7.05 7.21 3.34 12 3.34c2.28 0 4.4.87 6 2.44 1.57 1.56 2.44 3.67 2.44 5.99 0 4.79-3.7 8.5-8.5 8.5zM17.03 14.06c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.6.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.34-1.58-1.5-1.84-.16-.27-.02-.42.12-.56.12-.12.27-.32.4-.48.14-.16.18-.27.27-.46.09-.18 0-.34-.05-.47-.06-.14-.61-1.48-.84-2.03-.22-.52-.45-.45-.61-.45-.16 0-.34 0-.53 0-.18 0-.47.07-.72.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.68 1.12 2.86.14.18 1.94 3.02 4.7 4.23 1.8.77 2.56.85 3.48.71.55-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                      </svg>
                      <span>For Wholesale</span>
                    </a>
                  </li>

                  {showBecomeVendor && (
                    <li className="mt-2">
                      <Link
                        href="/auth/register/vendor"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg touch-manipulation"
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
                          className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group touch-manipulation"
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
                          className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group touch-manipulation"
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
                          className="flex items-center justify-center px-4 py-3 text-primary border-2 border-primary hover:bg-primary/10 rounded-lg font-semibold transition-all duration-300 touch-manipulation"
                          onClick={toggleSidebar}
                        >
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/auth/register"
                          className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg touch-manipulation"
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
