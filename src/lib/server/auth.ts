import { cookies } from 'next/headers';

import { AuthUser } from '@/types/auth';

const USER_COOKIE = 'auth_user';
const TOKEN_COOKIE = 'auth_token';

export interface CurrentUserResult {
  user: AuthUser | null;
  accessToken: string | null;
}

export const getCurrentUser = async (): Promise<CurrentUserResult> => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE)?.value;
  const token = cookieStore.get(TOKEN_COOKIE)?.value ?? null;

  if (!userCookie) {
    return { user: null, accessToken: token };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(userCookie)) as AuthUser;
    return { user: parsed, accessToken: token };
  } catch (error) {
    console.error('Failed to parse auth_user cookie', error);
    return { user: null, accessToken: token };
  }
};

