'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { GuestGuard } from '@/components/auth/GuestGuard';
import { ApiClientError } from '@/lib/apiClient';
import { registerVendor, getVendorApplicationStatus } from '@/services/authApi';
import { uploadVendorApplicationDoc } from '@/services/vendorDocsApi';
import { setLoading } from '@/store/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';

const initialVendor = {
  name: '',
  email: '',
  phone: '',
  password: '',
  businessName: '',
  gstNumber: '',
  aadharNumber: '',
  panNumber: '',
};

export default function VendorRegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const isLoggedIn = !!user && user.role === 'customer';

  // ALL hooks must be declared before any conditional returns
  const [vendorForm, setVendorForm] = useState(initialVendor);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [aadhaarDoc, setAadhaarDoc] = useState<{ url: string; fileName: string } | null>(null);
  const [aadhaarBackDoc, setAadhaarBackDoc] = useState<{ url: string; fileName: string } | null>(null);
  const [gstCertDoc, setGstCertDoc] = useState<{ url: string; fileName: string } | null>(null);
  const [panCardDoc, setPanCardDoc] = useState<{ url: string; fileName: string } | null>(null);
  const [uploading, setUploading] = useState<{ aadhaarFront: boolean; aadhaarBack: boolean; gst: boolean; pan: boolean }>({ aadhaarFront: false, aadhaarBack: false, gst: false, pan: false });

  // Check if user has a pending vendor application
  useEffect(() => {
    const checkVendorApplication = async () => {
      // Only check if user is logged in and has access token
      if (!isLoggedIn || !accessToken) {
        setCheckingApplication(false);
        return;
      }

      try {
        const response = await getVendorApplicationStatus(accessToken);
        if (response.application) {
          // User has an application, redirect to status page
          router.replace('/auth/register/vendor/status');
          return;
        }
      } catch (error) {
        // Handle different error cases gracefully
        if (error instanceof ApiClientError) {
          // 404 means no application exists - allow registration
          if (error.status === 404) {
            // This is fine, user can register - no need to log
          } 
          // Network error (status 0) - backend might be down, but allow registration
          else if (error.status === 0) {
            // Silently allow registration if backend is unavailable
            // User can still fill the form, it will fail on submit if backend is down
          }
          // Other errors - log but allow registration
          else if (error.status !== 401 && error.status !== 403) {
            // Only log non-auth errors
            console.error('Failed to check vendor application status', error);
          }
        }
        // For any other errors, silently allow registration to proceed
      } finally {
        setCheckingApplication(false);
      }
    };

    checkVendorApplication();
  }, [isLoggedIn, accessToken, router]);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setVendorForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        password: '', // Don't pre-fill password
      }));
    }
  }, [isLoggedIn, user]);

  // Show loading while checking application status (AFTER all hooks are declared)
  if (checkingApplication) {
    return (
      <GuestGuard allowCustomers>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Checking application status...</p>
          </div>
        </div>
      </GuestGuard>
    );
  }

  const handleVendorChange = (field: keyof typeof vendorForm, value: string) => {
    setVendorForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateVendor = () => {
    const { name, email, phone, password, businessName, gstNumber, aadharNumber, panNumber } = vendorForm;
    
    // If not logged in, require name and password
    if (!isLoggedIn) {
      if (!name.trim()) {
        setError('Please provide your full name.');
        return false;
      }

      if (!email.trim() && !phone.trim()) {
        setError('Please provide at least an email address or phone number.');
        return false;
      }

      // if (!password || password.length < 6) {
      //   setError('Password must be at least 6 characters long.');
      //   return false;
      // }
    } else {
      // If logged in, name should already be set from user data
      if (!name.trim()) {
        setError('Name is required.');
        return false;
      }
    }

    if (!businessName.trim()) {
      setError('Please provide your business name.');
      return false;
    }

    if (!gstNumber.trim()) {
      setError('GST number is required for vendor registration.');
      return false;
    }

    if (!aadharNumber.trim()) {
      setError('Aadhaar number is required for vendor registration.');
      return false;
    }

    if (!panNumber.trim()) {
      setError('PAN number is required for vendor registration.');
      return false;
    }

    if (!aadhaarDoc?.url) {
      setError('Please upload your Aadhaar FRONT image (required).');
      return false;
    }

    if (!aadhaarBackDoc?.url) {
      setError('Please upload your Aadhaar BACK image (required).');
      return false;
    }

    if (!gstCertDoc?.url) {
      setError('Please upload your GST certificate document (required).');
      return false;
    }

    if (!panCardDoc?.url) {
      setError('Please upload your PAN card document (required).');
      return false;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue.');
      return false;
    }

    return true;
  };

  const handleVendorRegister = async () => {
    if (!validateVendor()) {
      return;
    }

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      // Prepare registration data - exclude password if logged in
      const registrationData: any = {
        name: vendorForm.name,
        email: vendorForm.email || undefined,
        phone: vendorForm.phone ? vendorForm.phone.replace(/[^\d]/g, '') : undefined,
        businessName: vendorForm.businessName,
        gstNumber: vendorForm.gstNumber,
        aadharNumber: vendorForm.aadharNumber,
        panNumber: vendorForm.panNumber,
        documents: [
          { type: 'aadhaarFront', url: aadhaarDoc?.url, fileName: aadhaarDoc?.fileName },
          { type: 'aadhaarBack', url: aadhaarBackDoc?.url, fileName: aadhaarBackDoc?.fileName },
          { type: 'gstCertificate', url: gstCertDoc?.url, fileName: gstCertDoc?.fileName },
          { type: 'panCard', url: panCardDoc?.url, fileName: panCardDoc?.fileName },
        ],
      };

      // Only include password if user is not logged in AND password is provided
      // Explicitly exclude password when logged in
      if (!isLoggedIn && vendorForm.password && vendorForm.password.trim().length > 0) {
        registrationData.password = vendorForm.password;
      }
      // Ensure password is not in the payload when logged in
      if (isLoggedIn) {
        delete registrationData.password;
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Vendor Registration]', {
          isLoggedIn,
          hasAccessToken: !!accessToken,
          accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
          user: user ? { id: user.id, email: user.email, role: user.role } : null,
          registrationDataKeys: Object.keys(registrationData),
          hasPassword: 'password' in registrationData,
          passwordValue: 'password' in registrationData ? (registrationData.password ? '***' : 'empty') : 'not present',
        });
      }

      await registerVendor(registrationData, accessToken);
      setSuccessMessage(
        'Vendor application submitted successfully! We will notify you once the admin verifies your documents.',
      );
      setVendorForm(initialVendor);
      setTermsAccepted(false);
      setAadhaarDoc(null);
      setAadhaarBackDoc(null);
      setGstCertDoc(null);
      setPanCardDoc(null);
      
      // Redirect based on login status
      if (isLoggedIn) {
        setTimeout(() => router.replace('/profile'), 2500);
      } else {
        setTimeout(() => router.replace('/auth/login'), 2500);
      }
    } catch (err) {
      console.error('Vendor registration failed', err);
      let message = 'Unable to submit vendor application right now.';
      
      if (err instanceof ApiClientError) {
        message = err.message;
      } else if (err instanceof Error) {
        // Check if it's a network error
        if (err.message.includes('Failed to fetch') || err.message.includes('Network request failed')) {
          message = 'Unable to connect to the server. Please make sure the backend server is running and try again.';
        } else {
          message = err.message;
        }
      }
      
      setError(message);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    await handleVendorRegister();
  };

  return (
    <GuestGuard allowCustomers>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="bg-surface rounded-2xl shadow-card p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Become a Vendor</h1>
            <p className="text-muted">Join our marketplace and start selling to businesses</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full name<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={vendorForm.name}
                  onChange={(event) => handleVendorChange('name', event.target.value)}
                  placeholder="Jane Smith"
                  disabled={isLoggedIn}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={vendorForm.email}
                  onChange={(event) => handleVendorChange('email', event.target.value)}
                  placeholder="you@business.com"
                  disabled={isLoggedIn}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone number</label>
                <input
                  type="tel"
                  value={vendorForm.phone}
                  onChange={(event) => handleVendorChange('phone', event.target.value)}
                  placeholder="+91 98765 12345"
                  disabled={isLoggedIn}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Business name<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={vendorForm.businessName}
                  onChange={(event) => handleVendorChange('businessName', event.target.value)}
                  placeholder="Your Business Pvt Ltd"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GST Number<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={vendorForm.gstNumber}
                  onChange={(event) => handleVendorChange('gstNumber', event.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Aadhaar Number<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={vendorForm.aadharNumber}
                  onChange={(event) => handleVendorChange('aadharNumber', event.target.value)}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  PAN Number<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={vendorForm.panNumber}
                  onChange={(event) => handleVendorChange('panNumber', event.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Document uploads */}
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <h3 className="text-base font-semibold text-foreground">Verification documents</h3>
                  <p className="mt-1 text-sm text-muted">
                    Upload Aadhaar, GST certificate, and PAN card (PDF / Image). Required for approval.
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <label className="block text-sm font-semibold text-foreground">
                        Aadhaar Front<span className="text-danger ml-1">*</span>
                      </label>
                      <p className="mt-1 text-xs text-muted">PDF / JPG / PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="mt-3 block w-full text-sm"
                        disabled={loading || uploading.aadhaarFront}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setError('');
                            setUploading((p) => ({ ...p, aadhaarFront: true }));
                            const res = await uploadVendorApplicationDoc(file);
                            setAadhaarDoc({ url: res.file.url, fileName: res.file.originalName });
                          } catch (err) {
                            console.error('Aadhaar upload failed', err);
                            setAadhaarDoc(null);
                            setError(
                              err instanceof ApiClientError
                                ? err.message
                                : 'Failed to upload Aadhaar front. Please try again.',
                            );
                          } finally {
                            setUploading((p) => ({ ...p, aadhaarFront: false }));
                          }
                        }}
                      />
                      <div className="mt-3 text-xs">
                        {uploading.aadhaarFront ? (
                          <span className="text-muted">Uploading…</span>
                        ) : aadhaarDoc?.url ? (
                          <a className="text-primary font-semibold hover:text-primary/80" href={aadhaarDoc.url} target="_blank" rel="noreferrer">
                            Uploaded: {aadhaarDoc.fileName.slice(0, 20)}...
                          </a>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4">
                      <label className="block text-sm font-semibold text-foreground">
                        Aadhaar Back<span className="text-danger ml-1">*</span>
                      </label>
                      <p className="mt-1 text-xs text-muted">PDF / JPG / PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="mt-3 block w-full text-sm"
                        disabled={loading || uploading.aadhaarBack}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setError('');
                            setUploading((p) => ({ ...p, aadhaarBack: true }));
                            const res = await uploadVendorApplicationDoc(file);
                            setAadhaarBackDoc({ url: res.file.url, fileName: res.file.originalName });
                          } catch (err) {
                            console.error('Aadhaar back upload failed', err);
                            setAadhaarBackDoc(null);
                            setError(
                              err instanceof ApiClientError
                                ? err.message
                                : 'Failed to upload Aadhaar back. Please try again.',
                            );
                          } finally {
                            setUploading((p) => ({ ...p, aadhaarBack: false }));
                          }
                        }}
                      />
                      <div className="mt-3 text-xs">
                        {uploading.aadhaarBack ? (
                          <span className="text-muted">Uploading…</span>
                        ) : aadhaarBackDoc?.url ? (
                          <a className="text-primary font-semibold hover:text-primary/80" href={aadhaarBackDoc.url} target="_blank" rel="noreferrer">
                            Uploaded: {aadhaarBackDoc.fileName.slice(0, 20)}...
                          </a>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4">
                      <label className="block text-sm font-semibold text-foreground">
                        GST Certificate<span className="text-danger ml-1">*</span>
                      </label>
                      <p className="mt-1 text-xs text-muted">PDF / JPG / PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="mt-3 block w-full text-sm"
                        disabled={loading || uploading.gst}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setError('');
                            setUploading((p) => ({ ...p, gst: true }));
                            const res = await uploadVendorApplicationDoc(file);
                            setGstCertDoc({ url: res.file.url, fileName: res.file.originalName });
                          } catch (err) {
                            console.error('GST certificate upload failed', err);
                            setGstCertDoc(null);
                            setError(
                              err instanceof ApiClientError
                                ? err.message
                                : 'Failed to upload GST certificate. Please try again.',
                            );
                          } finally {
                            setUploading((p) => ({ ...p, gst: false }));
                          }
                        }}
                      />
                      <div className="mt-3 text-xs">
                        {uploading.gst ? (
                          <span className="text-muted">Uploading…</span>
                        ) : gstCertDoc?.url ? (
                          <a className="text-primary font-semibold hover:text-primary/80" href={gstCertDoc.url} target="_blank" rel="noreferrer">
                            Uploaded: {gstCertDoc.fileName.slice(0, 20)}...
                          </a>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4">
                      <label className="block text-sm font-semibold text-foreground">
                        PAN Card<span className="text-danger ml-1">*</span>
                      </label>
                      <p className="mt-1 text-xs text-muted">PDF / JPG / PNG (max 5MB)</p>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="mt-3 block w-full text-sm"
                        disabled={loading || uploading.pan}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setError('');
                            setUploading((p) => ({ ...p, pan: true }));
                            const res = await uploadVendorApplicationDoc(file);
                            setPanCardDoc({ url: res.file.url, fileName: res.file.originalName });
                          } catch (err) {
                            console.error('PAN card upload failed', err);
                            setPanCardDoc(null);
                            setError(
                              err instanceof ApiClientError
                                ? err.message
                                : 'Failed to upload PAN card. Please try again.',
                            );
                          } finally {
                            setUploading((p) => ({ ...p, pan: false }));
                          }
                        }}
                      />
                      <div className="mt-3 text-xs">
                        {uploading.pan ? (
                          <span className="text-muted">Uploading…</span>
                        ) : panCardDoc?.url ? (
                          <a
                            className="text-primary font-semibold hover:text-primary/80"
                            href={panCardDoc.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Uploaded: {panCardDoc.fileName.slice(0, 20)}...
                          </a>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {!isLoggedIn && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password<span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    value={vendorForm.password}
                    onChange={(event) => handleVendorChange('password', event.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    minLength={6}
                    required
                  />
                </div>
              )}
              {isLoggedIn && (
                <div className="md:col-span-2">
                  <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl p-4 text-sm">
                    <p className="font-semibold mb-1">You are logged in as {user?.name || user?.email}</p>
                    <p className="text-primary/80">Your vendor application will be linked to your existing account. No password required.</p>
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-start cursor-pointer gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/50 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
              <span className="text-sm text-muted">
                I agree to the{' '}
                <button type="button" className="text-primary hover:text-primary/80 font-medium">
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary hover:text-primary/80 font-medium">
                  Privacy Policy
                </button>
                .
              </span>
            </label>

            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-success/10 border border-success/20 text-success rounded-xl p-4 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit vendor application'}
            </button>
          </form>

          { !isLoggedIn && <p className="text-center text-muted mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in instead
            </Link>
          </p>}

          { !isLoggedIn && <p className="text-center text-muted mt-4 text-sm">
            Want to register as a customer?{' '}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Register as customer
            </Link>
          </p>}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}

