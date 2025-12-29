import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles } from 'lucide-react';

import { getCurrentUser } from '@/lib/server/auth';
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
              <Link
                href="/auth/register/vendor"
                className="shrink-0 z-10 inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 rounded-lg border border-white/25 text-white font-semibold text-sm whitespace-nowrap bg-white/10 hover:bg-white/15 hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {/* <Sparkles className="w-4 h-4 text-secondary" /> */}
                <span className="hidden lg:inline">Become a Vendor</span>
                <span className="lg:hidden">Vendor</span>
              </Link>
            )}
          </div>
        </div>
      </nav>


    </header>
  );
}