'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hourglass,
  CheckCircle2,
  XCircle,
  Store,
  FileText,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { getVendorApplicationStatus, VendorApplicationStatus, fetchProfile } from '@/services/authApi';
import { hydrateUser } from '@/store/redux/slices/authSlice';
import { persistAuthSession } from '@/utils/authSession';
import { ApiClientError } from '@/lib/apiClient';

export default function VendorApplicationStatusPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [vendorApplication, setVendorApplication] = useState<VendorApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user || !accessToken) {
        router.replace('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const response = await getVendorApplicationStatus(accessToken);
        setVendorApplication(response.application);
        
        // If no application exists, redirect to registration
        if (!response.application) {
          router.replace('/auth/register/vendor');
        }
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) {
          // No application found, redirect to registration
          router.replace('/auth/register/vendor');
        } else {
          console.error('Failed to fetch vendor application status', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user, accessToken, router]);

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

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading application status...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!vendorApplication) {
    return null; // Will redirect
  }

  const getStatusConfig = () => {
    switch (vendorApplication.status) {
      case 'pending':
        return {
          icon: Hourglass,
          title: 'Application Under Review',
          description: 'Your vendor application is currently being reviewed by our team.',
          bgColor: 'from-amber-500/10 to-amber-500/5',
          borderColor: 'border-amber-500/20',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-600',
          badgeBg: 'bg-amber-500/20',
          badgeText: 'text-amber-600',
          badgeLabel: 'Pending Review',
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          title: 'Application Approved',
          description: 'Congratulations! Your vendor application has been approved.',
          bgColor: 'from-emerald-500/10 to-emerald-500/5',
          borderColor: 'border-emerald-500/20',
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-600',
          badgeBg: 'bg-emerald-500/20',
          badgeText: 'text-emerald-600',
          badgeLabel: 'Approved',
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Application Rejected',
          description: 'Unfortunately, your vendor application could not be approved at this time.',
          bgColor: 'from-rose-500/10 to-rose-500/5',
          borderColor: 'border-rose-500/20',
          iconBg: 'bg-rose-500/20',
          iconColor: 'text-rose-600',
          badgeBg: 'bg-rose-500/20',
          badgeText: 'text-rose-600',
          badgeLabel: 'Rejected',
        };
      default:
        return {
          icon: FileText,
          title: 'Application Status',
          description: 'View your vendor application status.',
          bgColor: 'from-primary/10 to-primary/5',
          borderColor: 'border-primary/20',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          badgeBg: 'bg-primary/20',
          badgeText: 'text-primary',
          badgeLabel: 'Unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className={`bg-gradient-to-br ${statusConfig.bgColor} rounded-2xl border ${statusConfig.borderColor} shadow-lg p-8`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${statusConfig.iconBg} rounded-2xl mb-4`}>
                <StatusIcon className={`w-8 h-8 ${statusConfig.iconColor}`} />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{statusConfig.title}</h1>
              <p className="text-muted">{statusConfig.description}</p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.badgeBg} ${statusConfig.badgeText}`}>
                {statusConfig.badgeLabel}
              </span>
            </div>

            {/* Application Details */}
            <div className="bg-surface rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Application Details
              </h2>
              <div className="space-y-4">
                {vendorApplication.businessName && (
                  <div className="flex items-start gap-3">
                    <Store className="w-5 h-5 text-muted mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-muted/80 mb-1">Business Name</p>
                      <p className="text-sm font-semibold text-foreground">{vendorApplication.businessName}</p>
                    </div>
                  </div>
                )}

                {vendorApplication.gstNumber && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-muted/80 mb-1">GST Number</p>
                      <p className="text-sm font-semibold text-foreground">{vendorApplication.gstNumber}</p>
                    </div>
                  </div>
                )}

                {vendorApplication.submittedAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-muted/80 mb-1">Submitted On</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(vendorApplication.submittedAt).toLocaleDateString('en-US', {
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

                {vendorApplication.reviewedAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase text-muted/80 mb-1">Reviewed On</p>
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(vendorApplication.reviewedAt).toLocaleDateString('en-US', {
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

            {/* Admin Notes (if rejected) */}
            {vendorApplication.status === 'rejected' && vendorApplication.adminNotes && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Admin Notes</h3>
                <p className="text-sm text-rose-700 dark:text-rose-300">{vendorApplication.adminNotes}</p>
              </div>
            )}

            {/* Info Message */}
            {vendorApplication.status === 'pending' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your vendor application is currently under review. Our team will carefully examine your documents and business information. 
                  You will receive an email notification once the review is complete. This process typically takes 2-5 business days.
                </p>
              </div>
            )}

            {vendorApplication.status === 'approved' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Your vendor account has been activated! You can now start listing products and managing your business on our platform.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/profile"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>

              {vendorApplication.status === 'rejected' && (
                <Link
                  href="/auth/register/vendor"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Reapply as Vendor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {vendorApplication.status === 'approved' && (
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
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to Vendor Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}


