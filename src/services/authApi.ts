import { apiClient } from "@/lib/apiClient";
import { AuthUser, UserRole } from "@/types/auth";

interface LoginWithPasswordPayload {
  identifier: string;
  password: string;
  role?: UserRole;
}

interface FirebaseLoginPayload {
  firebaseToken: string;
  role?: UserRole;
  name?: string;
  email?: string;
}

interface FirebaseRegisterPayload extends FirebaseLoginPayload {
  profile?: {
    email?: string;
  };
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface RegisterCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}

interface RegisterVendorPayload extends RegisterCustomerPayload {
  businessName: string;
  gstNumber?: string;
  aadharNumber?: string;
  panNumber?: string;
  documents?: Array<{
    type?: string;
    url?: string;
    fileName?: string;
  }>;
}

interface RegisterAdminPayload {
  name: string;
  email: string;
  password: string;
}

export const loginWithPassword = (payload: LoginWithPasswordPayload) =>
  apiClient<LoginResponse>("/api/auth/login/password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const loginWithGoogle = (payload: FirebaseLoginPayload) =>
  apiClient<LoginResponse>("/api/auth/login/firebase", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const registerWithFirebase = (payload: FirebaseRegisterPayload) =>
  apiClient<LoginResponse>("/api/auth/register/firebase", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const registerCustomer = (payload: RegisterCustomerPayload) =>
  apiClient<{ user: AuthUser }>("/api/auth/register/customer", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const registerVendor = (payload: RegisterVendorPayload, accessToken?: string | null) => {
  // If accessToken is provided and not empty, we should include it in the Authorization header
  // skipAuthHeader: false means we WILL include the auth header
  // skipAuthHeader: true means we WON'T include the auth header
  const hasValidToken = accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0;
  const shouldSkipAuth = !hasValidToken;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[registerVendor API]', {
      hasAccessToken: !!accessToken,
      accessTokenType: typeof accessToken,
      accessTokenLength: accessToken?.length || 0,
      hasValidToken,
      shouldSkipAuth,
      payloadKeys: Object.keys(payload),
      hasPasswordInPayload: 'password' in payload,
    });
  }
  
  return apiClient<{ user: AuthUser }>("/api/auth/register/vendor", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: shouldSkipAuth, // Skip auth header only if no valid token
    accessToken: hasValidToken ? accessToken : undefined,
  });
};

export const registerAdmin = (payload: RegisterAdminPayload) =>
  apiClient<{ user: AuthUser }>("/api/auth/register/admin", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const fetchProfile = (accessToken: string | null) =>
  apiClient<{ user: AuthUser }>("/api/auth/profile", {
    method: "GET",
    accessToken,
  });

export const logoutUser = () =>
  apiClient<{ message: string }>("/api/auth/logout", {
    method: "POST",
    skipAuthHeader: true,
  });

export const requestPasswordReset = (email: string) =>
  apiClient<{ message: string }>("/api/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthHeader: true,
  });

export const resetPasswordWithToken = (payload: { email: string; token: string; password: string }) =>
  apiClient<{ message: string }>("/api/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export const resetPasswordWithGoogle = (payload: { firebaseToken: string; password: string }) =>
  apiClient<{ message: string }>("/api/auth/password/reset/phone", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthHeader: true,
  });

export interface VendorApplicationStatus {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string | null;
  adminNotes?: string | null;
  businessName?: string;
  gstNumber?: string;
}

export const getVendorApplicationStatus = (accessToken: string | null) =>
  apiClient<{ application: VendorApplicationStatus | null }>("/api/auth/vendor-application/status", {
    method: "GET",
    accessToken,
  });


