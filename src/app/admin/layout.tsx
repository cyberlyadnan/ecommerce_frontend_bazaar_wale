'use client';

import { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  FileText,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Truck,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { logoutUser } from '@/services/authApi';
import { clearAuth } from '@/store/redux/slices/authSlice';
import { clearCart } from '@/store/redux/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { clearAuthSession } from '@/utils/authSession';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', description: 'Overview and KPIs', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', description: 'Order management', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', description: 'Catalogue oversight', icon: Boxes },
  { label: 'Categories', href: '/admin/categories', description: 'Manage taxonomy', icon: FolderTree },
  { label: 'Blogs', href: '/admin/blogs', description: 'Content & SEO', icon: FileText },
  { label: 'Vendors', href: '/admin/vendors', description: 'Partner management', icon: Users },
  { label: 'Queries', href: '/admin/queries', description: 'Contact inquiries', icon: MessageSquare },
  { label: 'Subscribers', href: '/admin/subscribers', description: 'Newsletter emails', icon: Mail },
  { label: 'Payments', href: '/admin/payments', description: 'Payouts and billing', icon: CreditCard },
  { label: 'Shipping', href: '/admin/shipping', description: 'Shipping pricing rules', icon: Truck },
  { label: 'Settings', href: '/admin/settings', description: 'Platform preferences', icon: Settings },
] as const;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const selectedLabel = useMemo(() => {
    const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
    return current?.label ?? 'Dashboard';
  }, [pathname]);

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

  const Sidebar = (
    <aside
      className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-72 bg-surface border-r border-border transition-transform duration-200 ease-out`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted">Admin</p>
            <h1 className="text-xl font-semibold text-foreground">Control Center</h1>
          </div>
          <button
            className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : 'border border-transparent text-muted hover:text-foreground hover:border-border'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span
                  className={`mt-1 rounded-lg p-2 ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/10 text-muted'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-muted group-hover:text-muted/80">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-background text-foreground">
        {Sidebar}

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex flex-1 flex-col min-h-screen">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 backdrop-blur px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-border bg-surface p-3 text-muted hover:text-foreground hover:border-foreground/40 transition-colors"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted/80">Current section</p>
                <h2 className="text-lg font-semibold text-foreground">{selectedLabel}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wide text-muted/70">Signed in as</span>
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  {user.email && <span className="text-xs text-muted">{user.email}</span>}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-danger hover:bg-danger hover:text-danger-foreground hover:border-danger transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div> {/* ✅ this div was missing before */}
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
