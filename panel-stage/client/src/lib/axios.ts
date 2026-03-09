import axios from 'axios';

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.getItem('${key}'):`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.setItem('${key}'):`, e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.removeItem('${key}'):`, e);
    }
  },
};

// Determine baseURL: Use proxy in browser to avoid CORS, direct URL only for SSR
const getBaseURL = () => {
  // In browser, always use proxy to avoid CORS issues
  if (typeof window !== 'undefined') {
    return '/api';
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye timeout
  withCredentials: true, // CORS with credentials
});

// Staging ortamı için default tenant ID
const STAGING_DEFAULT_TENANT_ID = 'cmi5of04z0000ksb3g5eyu6ts';
// Backend'in beklediği header formatı (küçük harf)
const TENANT_HEADER_NAME = 'x-tenant-id';

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // #region agent log
    // Debug logging removed - was causing CORS errors in production
    // fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'panel-stage/client/src/lib/axios.ts:58',message:'Axios request interceptor',data:{url:config.url,fullURL:config.baseURL + config.url,method:config.method},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    let token = null;
    let tenantIdToUse = null;

    if (typeof window !== 'undefined') {
      token = safeLocalStorage.getItem('accessToken');
      tenantIdToUse = safeLocalStorage.getItem('tenantId');
    } else {
      // Optional fallback for server-side Axios usage to prevent desync
      try {
        const { cookies } = require('next/headers');
        const cookiePromise = cookies() as any;

        // Use synchronous get if possible, otherwise we might be in SSR environment where cookies are async
        // Next.js 15 makes cookies() async but usually server components use next/server tools.
        // This is a dynamic try-catch specifically for interceptor edges.
        if (cookiePromise && typeof cookiePromise.get === 'function') {
          token = cookiePromise.get('accessToken')?.value || null;
          tenantIdToUse = cookiePromise.get('tenantId')?.value || null;
        }
      } catch (e) { } // Handle cases outside Next context safely
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ SaaS Multi-Tenant: Add tenant ID header
    // Auth endpoint'lerinde tenant ID ekleme (login ve refresh hariç)
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');

    if (!isAuthEndpoint && tenantIdToUse) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any)[TENANT_HEADER_NAME] = tenantIdToUse;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = safeLocalStorage.getItem('refreshToken');

          // If no refresh token, redirect to login immediately
          if (!refreshToken) {
            safeLocalStorage.removeItem('accessToken');
            safeLocalStorage.removeItem('refreshToken');

            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
              // Return a resolved promise to prevent error from bubbling up
              return Promise.resolve({ data: null });
            }

            return Promise.reject(error);
          }

          // Always use proxy in browser to avoid CORS
          const baseURL = '/api';

          // Use raw axios for refresh to avoid infinite loop
          // Create a new axios instance without interceptors to prevent loop
          const refreshAxios = axios.create({
            baseURL,
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
            withCredentials: true, // CORS with credentials
          });

          // Sadece production ortamında değil, her zaman tenant ID header'ı ekle
          const tenantId = safeLocalStorage.getItem('tenantId');
          const refreshHeaders: any = {
            Authorization: `Bearer ${refreshToken}`,
          };

          // Tenant ID varsa header'a ekle (tüm ortamlar için)
          if (tenantId) {
            refreshHeaders[TENANT_HEADER_NAME] = tenantId;
          }

          try {
            const response = await refreshAxios.post(
              '/auth/refresh',
              {},
              {
                headers: refreshHeaders,
              }
            );

            const { accessToken } = response.data;
            safeLocalStorage.setItem('accessToken', accessToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError: any) {
            // Refresh token request failed
            // This could be 401 (invalid refresh token) or 500 (server error)
            throw refreshError;
          }
        }
      } catch (refreshError: any) {
        // Refresh token is invalid, expired, or server error occurred
        if (typeof window !== 'undefined') {
          safeLocalStorage.removeItem('accessToken');
          safeLocalStorage.removeItem('refreshToken');

          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            // Redirect to login without showing error to user
            window.location.href = '/login';
            // Return a resolved promise to prevent error from bubbling up
            return Promise.resolve({ data: null });
          }
        }

        // If we're on login page, reject with the original error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

