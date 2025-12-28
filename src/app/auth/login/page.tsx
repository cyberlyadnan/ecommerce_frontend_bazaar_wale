'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { GuestGuard } from '@/components/auth/GuestGuard';
import { ApiClientError } from '@/lib/apiClient';
import { loginWithPassword, loginWithGoogle } from '@/services/authApi';
import { signInWithGoogle, signOutFirebase } from '@/lib/firebase/client';
import {
  clearAuth,
  setCredentials,
  setError as setAuthError,
  setLoading,
} from '@/store/redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/redux/store';
import { clearAuthSession, persistAuthSession } from '@/utils/authSession';
import { getRoleHomePath } from '@/utils/rolePaths';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const completeSignIn = async (accessToken: string, user: Awaited<ReturnType<typeof loginWithPassword>>['user']) => {
    dispatch(
      setCredentials({
        user,
        accessToken,
      }),
    );

    persistAuthSession(user, accessToken);

    const returnUrl = searchParams.get('returnUrl');
    const destination = returnUrl || getRoleHomePath(user.role);
    router.replace(destination);
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    dispatch(setAuthError(null));
    dispatch(setLoading(true));

    try {
      const trimmedIdentifier = identifier.trim();
      const response = await loginWithPassword({
        identifier: trimmedIdentifier,
        password,
      });

      await completeSignIn(response.accessToken, response.user);
    } catch (err) {
      console.error('Login failed', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.';
      setError(message);
      dispatch(setAuthError(message));
      dispatch(clearAuth());
      clearAuthSession();
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    dispatch(setAuthError(null));
    dispatch(setLoading(true));

    try {
      // Sign in with Google via Firebase
      const googleResult = await signInWithGoogle();
      
      // Get ID token and send to backend
      const response = await loginWithGoogle({
        firebaseToken: googleResult.idToken,
        email: googleResult.email || undefined,
        name: googleResult.name || undefined,
      });

      // Sign out from Firebase (we only need the token)
      await signOutFirebase();

      await completeSignIn(response.accessToken, response.user);
    } catch (err) {
      console.error('Google sign-in failed', err);
      await signOutFirebase();
      
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to sign in with Google. Please try again.';
      setError(message);
      dispatch(setAuthError(message));
      dispatch(clearAuth());
      clearAuthSession();
    } finally {
      setGoogleLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl shadow-2xl p-8 md:p-10 border border-border/50 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-5 shadow-lg">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.656 0 3-1.343 3-3s-1.344-3-3-3-3 1.343-3 3 1.344 3 3 3zM5 20a7 7 0 0114 0H5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted text-sm">
                Sign in to access your dashboard and continue your B2B journey
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
                  <span>Signing in...</span>
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
                <span className="px-4 bg-surface text-muted">Or continue with email</span>
              </div>
            </div>

            {/* Password Login Form */}
            <form className="space-y-5" onSubmit={handlePasswordLogin} noValidate>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email or Phone<span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="you@company.com or +91 98765 12345"
                    className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Password<span className="text-danger ml-1">*</span>
                  </label>
                  <input
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-background border-2 border-border rounded-xl text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    type="password"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-foreground transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-primary border-border rounded focus:ring-primary" />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="bg-danger/10 border-2 border-danger/20 text-danger rounded-xl p-4 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3.5 px-4 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="text-center text-muted mt-6 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
