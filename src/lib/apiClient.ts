import { store } from "@/store/redux/store";
import { setCredentials, clearAuth } from "@/store/redux/slices/authSlice";
import { persistAuthSession, clearAuthSession } from "@/utils/authSession";
import { AuthUser } from "@/types/auth";

export class ApiClientError extends Error {
  status: number;

  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

// Ensure we always have a full URL with protocol
const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    // If it already starts with http:// or https://, use it as is
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl.replace(/\/+$/, ''); // Remove trailing slashes
    }
    // If it's just a hostname or hostname:port, add http://
    return `http://${envUrl.replace(/^\/+/, '')}`;
  }
  // Default fallback
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiRequestOptions extends RequestInit {
  skipAuthHeader?: boolean;
  accessToken?: string | null;
}

interface RefreshResponse {
  accessToken: string;
  user: AuthUser;
}

let refreshPromise: Promise<RefreshResponse> | null = null;

const performTokenRefresh = async (): Promise<RefreshResponse> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshUrl = `${API_BASE_URL}/api/auth/refresh`;
      if (process.env.NODE_ENV === 'development') {
        console.debug('[apiClient] Refresh token URL:', refreshUrl);
      }
      
      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          (payload && (payload as { message?: string }).message) ||
          response.statusText ||
          "Refresh failed";

        throw new ApiClientError(response.status, message, payload);
      }

      return (await response.json()) as RefreshResponse;
    })()
      .then((data) => {
        store.dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.accessToken,
          })
        );
        persistAuthSession(data.user, data.accessToken);
        return data;
      })
      .catch((error) => {
        store.dispatch(clearAuth());
        clearAuthSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export async function apiClient<TResponse>(
  path: string,
  { skipAuthHeader, accessToken, headers, ...options }: ApiRequestOptions = {}
): Promise<TResponse> {
  const isFormData = options.body instanceof FormData;
  
  // For FormData, we need to let the browser set Content-Type with boundary
  // So we only set Authorization header if needed, and don't set Content-Type
  let requestHeaders: HeadersInit | undefined;
  
  if (isFormData) {
    // For FormData, only include Authorization if needed
    if (!skipAuthHeader && accessToken) {
      requestHeaders = {
        Authorization: `Bearer ${accessToken}`,
      };
    }
  } else {
    // For JSON, set Content-Type and Authorization
    const finalHeaders = new Headers(headers as HeadersInit);
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
    // Always set Authorization header if we have a token and shouldn't skip it
    if (!skipAuthHeader && accessToken) {
      const authValue = `Bearer ${accessToken}`;
      finalHeaders.set("Authorization", authValue);
      if (process.env.NODE_ENV === 'development') {
        console.debug('[apiClient] Setting Authorization header', {
          hasToken: !!accessToken,
          tokenPreview: accessToken.substring(0, 20) + '...',
          headerValue: authValue.substring(0, 30) + '...',
        });
      }
    }
    requestHeaders = finalHeaders;
  }

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders,
    credentials: "include",
    cache: "no-store",
  };

  // Ensure path starts with / for proper URL construction
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${normalizedPath}`;
  
  // Log in development to help debug URL issues
  if (process.env.NODE_ENV === 'development') {
    console.debug('[apiClient] Request URL:', fullUrl);
    console.debug('[apiClient] Request options:', {
      method: requestInit.method || 'GET',
      headers: Object.fromEntries(new Headers(requestHeaders as HeadersInit).entries()),
      hasBody: !!requestInit.body,
      skipAuthHeader,
      hasAccessToken: !!accessToken,
    });
  }
  
  const doFetch = async () => {
    try {
      return await fetch(fullUrl, requestInit);
    } catch (fetchError) {
      // Enhanced error logging for network failures
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      
      // Only log in development if explicitly needed (avoid console spam)
      // Network errors are common and expected when backend is down
      // The error will be properly handled by the calling code
      
      // Re-throw with more context as ApiClientError so it's properly handled
      throw new ApiClientError(
        0, // 0 status indicates network error
        `Network request failed: ${errorMessage}. Please check if the backend server is running at ${API_BASE_URL}`,
        { originalError: errorMessage, url: fullUrl }
      );
    }
  };

  let response: Response;
  try {
    response = await doFetch();
  } catch (error) {
    // If it's already an ApiClientError (network failure), re-throw it
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Otherwise, wrap it
    throw new ApiClientError(
      0,
      error instanceof Error ? error.message : 'Network request failed',
      error
    );
  }

  const isAuthEndpoint =
    path.startsWith("/api/auth/login") ||
    path.startsWith("/api/auth/register") ||
    path.startsWith("/api/auth/refresh") ||
    path.startsWith("/api/auth/logout");

  if (
    response.status === 401 &&
    !isAuthEndpoint &&
    !skipAuthHeader
  ) {
    try {
      const refreshed = await performTokenRefresh();
      
      // Update headers with new token
      if (isFormData) {
        // For FormData, just set Authorization
        requestHeaders = {
          Authorization: `Bearer ${refreshed.accessToken}`,
        };
      } else {
        // For JSON, update the Headers object
        const updatedHeaders = new Headers(requestHeaders as HeadersInit);
        updatedHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
        requestHeaders = updatedHeaders;
      }
      
      requestInit.headers = requestHeaders;
      response = await doFetch();
    } catch (error) {
      throw error;
    }
  }

  const isJson =
    response.headers.get("content-type")?.includes("application/json") ?? false;
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (payload as { message?: string })?.message) ||
      response.statusText ||
      "Request failed";
    throw new ApiClientError(response.status, message, payload);
  }

  return payload as TResponse;
}

