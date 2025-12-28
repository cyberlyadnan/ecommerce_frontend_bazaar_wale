'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppSelector } from '@/store/redux/store';

interface GuestGuardProps {
  children: ReactNode;
  /**
   * If true, allows customers to access this page (e.g., vendor registration)
   * If false, redirects all authenticated users
   */
  allowCustomers?: boolean;
}

/**
 * GuestGuard redirects authenticated users away from auth pages.
 * - If user is not logged in: allows access
 * - If user is customer and allowCustomers=true: allows access
 * - If user is customer and allowCustomers=false: redirects to profile
 * - If user is vendor/admin: always redirects to profile
 */
export function GuestGuard({ children, allowCustomers = false }: GuestGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      // Not logged in, allow access
      return;
    }

    // User is logged in
    if (user.role === 'vendor' || user.role === 'admin') {
      // Vendors and admins should not access any auth pages
      router.replace('/profile');
      return;
    }

    // User is a customer
    if (user.role === 'customer') {
      if (allowCustomers) {
        // Allow customers to access this page (e.g., vendor registration)
        return;
      } else {
        // Redirect customers away from login/register pages
        router.replace('/profile');
        return;
      }
    }
  }, [user, router, pathname, allowCustomers]);

  // Show loading state while checking or redirecting
  if (user && ((user.role === 'vendor' || user.role === 'admin') || (user.role === 'customer' && !allowCustomers))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

