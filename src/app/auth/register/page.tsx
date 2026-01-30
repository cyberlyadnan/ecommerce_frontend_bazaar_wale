'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { GuestGuard } from '@/components/auth/GuestGuard';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { isPasswordAcceptable } from '@/utils/validation';
import { ApiClientError } from '@/lib/apiClient';
import {
  loginWithPassword,
  registerCustomer,
  registerWithFirebase,
} from '@/services/authApi';
import { signInWithGoogle, signOutFirebase } from '@/lib/firebase/client';
import { setCredentials, setLoading } from '@/store/redux/slices/authSlice';
import { useAppDispatch } from '@/store/redux/store';
import { persistAuthSession } from '@/utils/authSession';
import { getRoleHomePath } from '@/utils/rolePaths';

const initialCustomer = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCustomerChange = (
    field: keyof typeof customerForm,
    value: string,
  ) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCustomer = () => {
    const { name, email, phone, password } = customerForm;

    if (!name.trim()) {
      setError('Please provide your full name.');
      return false;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please provide at least an email address or phone number.');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (!isPasswordAcceptable(password)) {
      setError('Password must be at least 8 characters and include a number or special character.');
      return false;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms & Conditions to continue.');
      return false;
    }

    return true;
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    dispatch(setLoading(true));

    try {
      // Sign in with Google via Firebase
      const googleResult = await signInWithGoogle();
      
      // Register/login with Google
      const response = await registerWithFirebase({
        firebaseToken: googleResult.idToken,
        role: 'customer',
        name: googleResult.name || undefined,
        email: googleResult.email || undefined,
      });

      // Sign out from Firebase (we only need the token)
      await signOutFirebase();

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        }),
      );

      persistAuthSession(response.user, response.accessToken);
      router.replace(getRoleHomePath('customer'));
    } catch (err) {
      console.error('Google registration failed', err);
      await signOutFirebase();
      
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to register with Google. Please try again.';
      setError(message);
    } finally {
      setGoogleLoading(false);
      dispatch(setLoading(false));
    }
  };

  const handleCustomerRegister = async () => {
    if (!validateCustomer()) return;

    setLocalLoading(true);
    dispatch(setLoading(true));
    setError('');
    setSuccessMessage('');

    try {
      await registerCustomer(customerForm);

      const identifier = customerForm.email.trim() || customerForm.phone.trim();

      if (identifier) {
        const loginResponse = await loginWithPassword({
          identifier,
          password: customerForm.password,
        });

        dispatch(
          setCredentials({
            user: loginResponse.user,
            accessToken: loginResponse.accessToken,
          }),
        );

        persistAuthSession(loginResponse.user, loginResponse.accessToken);
        router.replace(getRoleHomePath('customer'));
      } else {
        setSuccessMessage('Account created. You can now sign in.');
        setTimeout(() => router.replace('/auth/login'), 2000);
      }

      setCustomerForm(initialCustomer);
      setTermsAccepted(false);
    } catch (err) {
      console.error('Registration failed', err);

      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to complete registration right now.';

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
    await handleCustomerRegister();
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="bg-surface rounded-3xl shadow-2xl p-8 md:p-10 border border-border/50 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-5 shadow-lg">
                <svg
                  className="w-10 h-10 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create an Account
              </h1>
              <p className="text-muted text-sm">
                Join the B2B network and unlock tailored workflows
              </p>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-border rounded-xl py-3.5 px-4 font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing up...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-muted">Or register with email</span>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Full name<span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    placeholder="+91 98765 12345"
                    className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Password<span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={customerForm.password}
                  onChange={(e) => handleCustomerChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  minLength={8}
                  required
                />
                <div className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Password requirements
                  </p>
                  <PasswordStrength password={customerForm.password} />
                </div>
              </div>

              <label className="flex items-start cursor-pointer gap-3 p-4 bg-background rounded-xl border-2 border-border hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span className="text-sm text-muted">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 font-semibold"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              {error && (
                <div className="bg-danger/10 border-2 border-danger/20 text-danger rounded-xl p-4 text-sm flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                <div className="bg-success/10 border-2 border-success/20 text-success rounded-xl p-4 text-sm flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3.5 px-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="text-center text-muted mt-6 text-sm">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign in instead
              </Link>
            </p>

            <p className="text-center text-muted mt-4 text-sm">
              Want to sell on our platform?{' '}
              <Link
                href="/auth/register/vendor"
                className="text-primary hover:text-primary/80 font-semibold underline"
              >
                Register as vendor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
