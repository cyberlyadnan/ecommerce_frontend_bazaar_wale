import { AuthUser } from '@/types/auth';

const AUTH_USER_COOKIE = 'auth_user';
const AUTH_TOKEN_COOKIE = 'auth_token';

export const persistAuthSession = (
  user: AuthUser,
  accessToken: string,
  maxAgeSeconds = 60 * 60 * 24 * 3,
) => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_USER_COOKIE}=${encodeURIComponent(
    JSON.stringify(user),
  )}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
};

export const clearAuthSession = () => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_USER_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
};

