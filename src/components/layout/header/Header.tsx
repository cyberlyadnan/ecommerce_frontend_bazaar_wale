import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles } from 'lucide-react';

import { getCurrentUser } from '@/lib/server/auth';
import { getWholesaleWhatsAppHref } from '@/lib/whatsapp';
import { MobileMenu } from './MobileMenu';
import { UserMenu } from './UserMenu';
import { CartIcon } from './CartIcon';

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  // { label: 'Deals', href: '/deals' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Blogs', href: '/blog' },
];

export async function Header() {
  const { user } = await getCurrentUser();
  const showBecomeVendor = !user || user.role !== 'vendor';
  const whatsappHref = getWholesaleWhatsAppHref();

  return (
    <header className="w-full">
      {/* Top Announcement Bar */}
      {/* <div className="hidden md:block relative overflow-hidden bg-primary backdrop-blur-sm border-b border-primary/20">
        <div className="absolute inset-0 bg-white/10 animate-shimmer" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-white/90 animate-pulse" />
              <p className="text-xs font-medium text-white/95">
                Free shipping on orders over $50
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/help"
                className="text-sm font-medium text-white/90 hover:text-white transition-all duration-300 relative group"
              >
                Help Center
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white/90 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-white/90 hover:text-white transition-all duration-300 relative group"
              >
                Contact Us
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white/90 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Header */}
      <div className="relative z-50 bg-surface/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 group relative"
            >
              <div className="relative flex items-center">
                <div className="relative w-20 h-16 sm:w-12 sm:h-12 md:w-32 md:h-24">
                  <Image
                    src="/logo.png"
                    alt="Bazaarwale"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </Link>

            {/* Search Bar - Desktop - Next-Gen Design */}
            <div className="hidden md:flex flex-1 max-w-xl mx-6 lg:mx-8">
              <form className="w-full relative group" action="/search" method="GET">
                <div className="relative flex items-center">
                  {/* Search Icon Container */}
                  <div className="absolute left-5 z-10">
                    <div className="p-2 rounded-xl bg-primary/5 group-focus-within:bg-primary/10 transition-all duration-300">
                      <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors duration-300" />
                    </div>
                  </div>
                  
                  {/* Search Input */}
                  <input
                    type="search"
                    name="q"
                    placeholder="Search for products, brands, and more..."
                    className="w-full pl-16 pr-14 py-4 bg-surface rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-base text-foreground placeholder:text-muted shadow-md hover:shadow-xl hover:border-border group-hover:bg-surface"
                    aria-label="Search products"
                  />
                </div>
              </form>
            </div>

            {/* Right Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2 md:gap-3">
              <CartIcon />
              <UserMenu user={user} />
            </div>

            {/* Right Actions - Mobile (Menu, Search, Cart) */}
            <div className="flex md:hidden items-center gap-2">
              <MobileMenu navLinks={navLinks} user={user} showBecomeVendor={showBecomeVendor} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Sticky */}
      <nav className="sticky top-0 z-50 hidden md:block relative bg-primary border-b border-primary/20 shadow-md backdrop-blur-md">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-primary opacity-95" />
        
        <div className="relative bg-transparent z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <ul className="flex items-center gap-1 sm:gap-4 flex-wrap h-full">
              {navLinks.map((link) => (
                <li key={link.href} className="h-full flex items-center">
                  <Link
                    href={link.href}
                    className="relative block px-4 sm:px-6 h-full flex items-center text-sm sm:text-base font-semibold text-white/90 hover:text-white transition-all duration-300 group"
                  >
                    <span className="relative z-10">{link.label}</span>
                    {/* Hover underline effect */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                    {/* Background glow on hover */}
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Become a Vendor Button */}
            {showBecomeVendor && (
              <div className="flex items-center gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 z-10 inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm whitespace-nowrap hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M20.52 3.48A11.3 11.3 0 0012.01 0C5.37 0 .17 5.2.17 11.84c0 2.08.54 4.12 1.57 5.92L0 24l6.46-1.69A11.8 11.8 0 0011.97 24h.01c6.64 0 11.84-5.2 11.84-11.84 0-3.17-1.24-6.14-3.3-8.49zM12 21.5c-1.2 0-2.38-.32-3.4-.93l-.24-.14-3.83 1.01 1.02-3.73-.16-.27A8.7 8.7 0 013.5 11.84C3.5 7.05 7.21 3.34 12 3.34c2.28 0 4.4.87 6 2.44 1.57 1.56 2.44 3.67 2.44 5.99 0 4.79-3.7 8.5-8.5 8.5zM17.03 14.06c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.6.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.34-1.58-1.5-1.84-.16-.27-.02-.42.12-.56.12-.12.27-.32.4-.48.14-.16.18-.27.27-.46.09-.18 0-.34-.05-.47-.06-.14-.61-1.48-.84-2.03-.22-.52-.45-.45-.61-.45-.16 0-.34 0-.53 0-.18 0-.47.07-.72.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.68 1.12 2.86.14.18 1.94 3.02 4.7 4.23 1.8.77 2.56.85 3.48.71.55-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                  </svg>
                  <span className="hidden lg:inline">For Wholesale</span>
                  <span className="lg:hidden">Wholesale</span>
                </a>

                <Link
                  href="/auth/register/vendor"
                  className="shrink-0 z-10 inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-lg border border-white/25 text-white font-semibold text-sm whitespace-nowrap bg-white/10 hover:bg-white/15 hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="hidden lg:inline">Become a Vendor</span>
                  <span className="lg:hidden">Vendor</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>


    </header>
  );
}