'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiClientError } from '@/lib/apiClient';
import { loginWithPassword, registerAdmin } from '@/services/authApi';
import { setCredentials, setLoading } from '@/store/redux/slices/authSlice';
import { useAppDispatch } from '@/store/redux/store';
import { persistAuthSession } from '@/utils/authSession';
import { getRoleHomePath } from '@/utils/rolePaths';
import { GuestGuard } from '@/components/auth/GuestGuard';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

export default function AdminRegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      setError('Please provide the admin name.');
      return false;
    }

    if (!form.email.trim()) {
      setError('Please provide a valid email address.');
      return false;
    }

    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      await registerAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const loginResponse = await loginWithPassword({
        identifier: form.email.trim(),
        password: form.password,
        role: 'admin',
      });

      dispatch(
        setCredentials({
          user: loginResponse.user,
          accessToken: loginResponse.accessToken,
        }),
      );

      persistAuthSession(loginResponse.user, loginResponse.accessToken);

      setSuccessMessage('Admin account created. Redirecting to dashboard...');

      await new Promise((resolve) => setTimeout(resolve, 750));

      router.replace(getRoleHomePath('admin'));
    } catch (err) {
      console.error('Admin registration failed', err);
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to create admin right now.';
      setError(message);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="bg-surface rounded-2xl shadow-card p-8 border border-destructive/30">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/90 text-destructive-foreground mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 8h10l-1 12H8L7 8zm3-4h4l1 4H9l1-4z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Temporary Admin Registration</h1>
            <p className="text-muted mt-2">
              This route is intended for seeding a single admin user. Remove or protect this page after use.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-destructive"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-destructive"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-destructive"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(event) => handleChange('password', event.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-500">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-destructive px-4 py-3 font-semibold text-destructive-foreground shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creating admin...' : 'Create admin & sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/register" className="text-sm font-medium text-muted hover:text-foreground">
              Back to standard registration
            </Link>
          </div>
        </div>
      </div>
    </div>
    </GuestGuard>
  );
}


