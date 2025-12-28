'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  User,
  Package,
  ShoppingCart,
  Heart,
  Clock,
  Store,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogOut,
  FileText,
  Hourglass,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { getRoleHomePath } from '@/utils/rolePaths';
import { logoutUser, getVendorApplicationStatus, VendorApplicationStatus, fetchProfile } from '@/services/authApi';
import { clearAuth, hydrateUser } from '@/store/redux/slices/authSlice';
import { clearCart } from '@/store/redux/slices/cartSlice';
import { clearAuthSession, persistAuthSession } from '@/utils/authSession';
import { ApiClientError } from '@/lib/apiClient';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [vendorApplication, setVendorApplication] = useState<VendorApplicationStatus | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);

  useEffect(() => {
    const fetchVendorApplication = async () => {
      // Check for vendor application if user is customer
      if (user && user.role === 'customer' && accessToken) {
        try {
          setLoadingApplication(true);
          const response = await getVendorApplicationStatus(accessToken);
          setVendorApplication(response.application);
        } catch (error) {
          if (error instanceof ApiClientError && error.status !== 404) {
            console.error('Failed to fetch vendor application status', error);
          }
          // 404 or no application is fine - just means no application exists
          setVendorApplication(null);
        } finally {
          setLoadingApplication(false);
        }
      } else {
        setLoadingApplication(false);
      }
    };

    fetchVendorApplication();
  }, [user, accessToken]);

  // Refresh user data when application is approved and user role is still customer
  useEffect(() => {
    const refreshUserIfApproved = async () => {
      if (
        vendorApplication?.status === 'approved' &&
        user &&
        user.role === 'customer' &&
        accessToken
      ) {
        try {
          // Fetch the latest user profile to get the updated role
          const profileResponse = await fetchProfile(accessToken);
          // Update Redux store with the new user data (which should now have role='vendor')
          dispatch(hydrateUser(profileResponse.user));
          // Also update the session cookie with the new user data
          persistAuthSession(profileResponse.user, accessToken);
        } catch (error) {
          console.error('Failed to refresh user profile after approval', error);
        }
      }
    };

    refreshUserIfApproved();
  }, [vendorApplication, user, accessToken, dispatch]);

  if (!user) {
    return null;
  }

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

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted mt-2">Manage your account and view your activity</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-danger/30 text-danger font-semibold hover:bg-danger/10 hover:text-gray-700 hover:border-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Details Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                    <p className="text-sm text-muted">
                      {user.role === 'admin'
                        ? 'Administrator'
                        : user.role === 'vendor'
                        ? 'Vendor'
                        : 'Customer'}
                    </p>
                  </div>
                </div>
                {user.role === 'vendor' && user.vendorStatus && (
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.vendorStatus === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : user.vendorStatus === 'pending'
                        ? 'bg-amber-500/10 text-amber-600'
                        : user.vendorStatus === 'rejected'
                        ? 'bg-rose-500/10 text-rose-600'
                        : 'bg-slate-500/10 text-slate-600'
                    }`}
                  >
                    {user.vendorStatus.charAt(0).toUpperCase() + user.vendorStatus.slice(1)}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {user.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">Email</p>
                      <p className="text-sm text-foreground mt-1">{user.email}</p>
                      {user.isEmailVerified ? (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <XCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-amber-600">Not verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">Phone</p>
                      <p className="text-sm text-foreground mt-1">{user.phone}</p>
                      {user.isPhoneVerified ? (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <XCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-xs text-amber-600">Not verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user.businessName && (
                  <div className="flex items-start gap-3">
                    <Store className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">Business Name</p>
                      <p className="text-sm text-foreground mt-1">{user.businessName}</p>
                    </div>
                  </div>
                )}

                {user.gstNumber && (
                  <div className="flex items-start gap-3">
                    <Store className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">GST Number</p>
                      <p className="text-sm text-foreground mt-1">{user.gstNumber}</p>
                    </div>
                  </div>
                )}

                {user.createdAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">Member Since</p>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {user.lastLoginAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-muted/80">Last Login</p>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">My Orders</p>
                    <p className="text-xs text-muted">View order history</p>
                  </div>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Shopping Cart</p>
                    <p className="text-xs text-muted">Review your cart</p>
                  </div>
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Favorites</p>
                    <p className="text-xs text-muted">Saved products</p>
                  </div>
                </Link>

                <Link
                  href="/history"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">History</p>
                    <p className="text-xs text-muted">Browse history</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Application Status or Become a Seller Card - Only for customers */}
            {user.role === 'customer' && (
              <>
                {loadingApplication ? (
                  <div className="bg-surface rounded-xl border border-border p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ) : vendorApplication && vendorApplication.status === 'approved' ? (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Vendor Application Approved</h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Status</span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600">
                          Approved
                        </span>
                      </div>
                      {vendorApplication.businessName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Business Name</span>
                          <span className="text-sm font-semibold text-foreground">{vendorApplication.businessName}</span>
                        </div>
                      )}
                      {vendorApplication.gstNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">GST Number</span>
                          <span className="text-sm font-semibold text-foreground">{vendorApplication.gstNumber}</span>
                        </div>
                      )}
                      {vendorApplication.reviewedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Approved On</span>
                          <span className="text-sm text-foreground">
                            {new Date(vendorApplication.reviewedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Congratulations! Your vendor application has been approved. You can now access the vendor dashboard.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        // Ensure user data is refreshed before navigation
                        if (user && user.role === 'customer' && accessToken) {
                          try {
                            const profileResponse = await fetchProfile(accessToken);
                            dispatch(hydrateUser(profileResponse.user));
                            persistAuthSession(profileResponse.user, accessToken);
                            // Wait a moment for Redux to update, then navigate
                            setTimeout(() => {
                              router.push('/vendor/dashboard');
                            }, 100);
                          } catch (error) {
                            console.error('Failed to refresh user profile', error);
                            // Still try to navigate - the AuthGuard will handle it
                            router.push('/vendor/dashboard');
                          }
                        } else {
                          router.push('/vendor/dashboard');
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Move to Vendor Panel
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : vendorApplication && vendorApplication.status === 'pending' ? (
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Hourglass className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Vendor Application</h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">Status</span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-600">
                          Pending Review
                        </span>
                      </div>
                      {vendorApplication.businessName && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Business Name</span>
                          <span className="text-sm font-semibold text-foreground">{vendorApplication.businessName}</span>
                        </div>
                      )}
                      {vendorApplication.gstNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">GST Number</span>
                          <span className="text-sm font-semibold text-foreground">{vendorApplication.gstNumber}</span>
                        </div>
                      )}
                      {vendorApplication.submittedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted">Submitted</span>
                          <span className="text-sm text-foreground">
                            {new Date(vendorApplication.submittedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Your vendor application is under review. We'll notify you once it's been processed.
                      </p>
                    </div>
                  </div>
                ) : vendorApplication && vendorApplication.status === 'rejected' ? (
                  <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-xl border border-rose-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Application Rejected</h3>
                    </div>
                    {vendorApplication.adminNotes && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mb-4">
                        <p className="text-xs text-rose-700 dark:text-rose-300">{vendorApplication.adminNotes}</p>
                      </div>
                    )}
                    <Link
                      href="/auth/register/vendor"
                      className="block w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Reapply as Vendor
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Become a Seller</h3>
                    </div>
                    <p className="text-sm text-muted mb-4">
                      Start selling your products on our platform and reach thousands of customers.
                    </p>
                    <Link
                      href="/auth/register/vendor"
                      className="block w-full text-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Register as Vendor
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Move to Vendor Panel - Only for vendors */}
            {(user.role === 'vendor' || user.role === 'admin') && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{user.role === 'vendor' ? 'Vendor Panel' : 'Admin Panel'}</h3>
                </div>
                <p className="text-sm text-muted mb-4">
                  Access your {user.role === 'vendor' ? 'vendor' : 'admin'} dashboard to manage products, orders, and sales.
                </p>
                <Link
                  href={getRoleHomePath(user.role)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Move to {user.role === 'vendor' ? 'Vendor Panel' : 'Admin Panel'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Account Status */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Email Verification</span>
                  {user.isEmailVerified ? (
                    <span className="text-xs font-semibold text-emerald-600">Verified</span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Phone Verification</span>
                  {user.isPhoneVerified ? (
                    <span className="text-xs font-semibold text-emerald-600">Verified</span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600">Pending</span>
                  )}
                </div>
                {user.role === 'vendor' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Vendor Status</span>
                    <span
                      className={`text-xs font-semibold ${
                        user.vendorStatus === 'active'
                          ? 'text-emerald-600'
                          : user.vendorStatus === 'pending'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {user.vendorStatus
                        ? user.vendorStatus.charAt(0).toUpperCase() + user.vendorStatus.slice(1)
                        : 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout (mobile + sidebar) */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm sm:hidden">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-danger/30 text-danger font-semibold hover:bg-danger hover:text-danger-foreground hover:border-danger transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

