'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppSelector } from '@/store/redux/store';
import { UserRole } from '@/types/auth';
import { getRoleHomePath } from '@/utils/rolePaths';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectUnauthenticated?: boolean;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectUnauthenticated = true,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const isRoleAllowed = useMemo(() => {
    if (!user) {
      return false;
    }
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    return allowedRoles.includes(user.role);
  }, [allowedRoles, user]);

  useEffect(() => {
    if (!user) {
      if (redirectUnauthenticated) {
        const returnUrl = encodeURIComponent(pathname ?? '/');
        router.replace(`/auth/login?returnUrl=${returnUrl}`);
      }
      return;
    }

    if (!isRoleAllowed) {
      const fallback = getRoleHomePath(user.role);
      router.replace(fallback);
      return;
    }
  }, [isRoleAllowed, pathname, redirectUnauthenticated, router, user]);

  if (!user) {
    return null;
  }

  if (!isRoleAllowed) {
    return null;
  }

  return <>{children}</>;
}


