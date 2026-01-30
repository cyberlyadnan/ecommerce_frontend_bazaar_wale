'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { GuestGuard } from '@/components/auth/GuestGuard';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { ApiClientError } from '@/lib/apiClient';
import { resetPasswordWithToken } from '@/services/authApi';
import { isPasswordAcceptable } from '@/utils/validation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!email || !token) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    if (!isPasswordAcceptable(password)) {
      setError('Password must be at least 8 characters and include a number or special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken({ email, token, password });
      setStatus('Password reset successfully. You can now sign in.');
      setTimeout(() => router.replace('/auth/login'), 2000);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to reset your password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-surface rounded-2xl shadow-card p-8 border border-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.656 0 3-1.343 3-3s-1.344-3-3-3-3 1.343-3 3 1.344 3 3 3zM5 21v-2a7 7 0 0114 0v2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Set a new password</h1>
            <p className="text-muted">Enter your new password below to secure your account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New password<span className="text-danger ml-1">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                minLength={8}
              />
              <div className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Password requirements
                </p>
                <PasswordStrength
                  password={password}
                  confirmPassword={confirmPassword}
                  showConfirm
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm password<span className="text-danger ml-1">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                minLength={8}
              />
            </div>

            {status && <p className="text-sm text-success">{status}</p>}
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>

          <p className="text-center text-muted mt-6">
            Back to{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}

