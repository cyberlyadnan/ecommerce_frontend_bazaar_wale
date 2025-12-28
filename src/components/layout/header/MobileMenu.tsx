// components/Header/MobileMenu.tsx (Client Component)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronRight, Sparkles } from 'lucide-react';

import { AuthUser } from '@/types/auth';

interface MobileMenuProps {
  navLinks: Array<{ label: string; href: string }>;
  user: AuthUser | null;
}

export function MobileMenu({ navLinks, user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-surface/95 backdrop-blur-xl z-50 overflow-y-auto shadow-2xl border-r border-border/50 animate-in slide-in-from-left duration-300">
            <nav className="p-6">
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
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{link.label}</span>
                      <ChevronRight
                        size={20}
                        className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                      />
                    </Link>
                  </li>
                ))}

                {/* Become a Vendor Button - Only show if user is not vendor or admin */}
                {(!user || (user.role !== 'vendor' && user.role !== 'admin')) && (
                  <li className="mt-2">
                    <Link
                      href="/auth/register/vendor"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Become a Vendor
                    </Link>
                  </li>
                )}

                {user ? (
                  <>
                    <li className="mt-4 pt-4 border-t border-border/50">
                      <Link
                        href="/orders"
                        className="flex items-center justify-between px-4 py-3 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg font-semibold transition-all duration-200 group"
                        onClick={() => setIsOpen(false)}
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
                        onClick={() => setIsOpen(false)}
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
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/auth/register"
                        className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
