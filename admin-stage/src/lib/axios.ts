import { API_TIMEOUT, getApiBaseUrl, TENANT_HEADER_NAME } from '@/config/constants';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

// API Base URL - Sabit yapılandırmadan alınır (asla değişmez)
const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token and tenant ID)
api.interceptors.request.use((config: any) => {
  const authState = useAuthStore.getState();
  const token = authState.accessToken;
  const tenantId = authState.tenantId;
  const user = authState.user;

  // Admin kullanıcıları için özel kontrol
  const ADMIN_EMAILS = ['info@azemyazilim.com'];
  const userEmail = user?.email || '';
  const isAdminUser = ADMIN_EMAILS.some(email =>
    email.toLowerCase() === userEmail.toLowerCase()
  );

  // Authorization header ekle
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // SaaS multi-tenant için tenant ID header'ı ekle
  // Backend'in beklediği header adı constants.ts'de TENANT_HEADER_NAME olarak tanımlı
  // Login ve refresh endpoint'lerinde tenant ID göndermeyebiliriz (backend kullanıcıdan alabilir)
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');

  // Admin kullanıcısı için tenant ID zorunlu değil
  if (tenantId && !isAuthEndpoint) {
    config.headers[TENANT_HEADER_NAME] = tenantId;

    // Debug: Development modunda tenant ID header'ını logla
    if ((import.meta as any).env?.DEV) {
      console.log(`[API DEBUG] Request to ${config.url}:`, {
        method: config.method?.toUpperCase(),
        tenantHeader: TENANT_HEADER_NAME,
        tenantId: tenantId,
        hasAuth: !!token,
        headers: config.headers,
      });
    }
  } else if (!tenantId && !isAuthEndpoint) {
    // Admin kullanıcısı için tenant ID zorunlu değil
    if (isAdminUser) {
      // Admin kullanıcısı için tenant ID olmadan devam et
      if ((import.meta as any).env?.DEV) {
        console.log(`[API DEBUG] Admin user - skipping tenant ID requirement for ${config.url}`);
      }
    } else {
      // Son çare: User objesinden tenant ID'yi almayı dene
      const fallbackTenantId =
        authState.user?.tenantId ||
        authState.user?.tenant?.id ||
        null;

      if (fallbackTenantId) {
        console.warn(`[TENANT FALLBACK] Using tenant ID from user object: ${fallbackTenantId}`);
        localStorage.setItem('tenantId', fallbackTenantId);
        config.headers[TENANT_HEADER_NAME] = fallbackTenantId;
        useAuthStore.setState({ tenantId: fallbackTenantId });
      } else {
        // CRITICAL: Tenant ID yoksa hem dev hem production'da uyarı ver
        // Bu SaaS multi-tenant için kritik bir sorundur
        // console.error kullan (filter [CRITICAL ERROR] ile başlayan mesajları geçirmez)
        console.error(`[CRITICAL ERROR] No tenant ID found for request to ${config.url}!`);
        console.error(`[CRITICAL ERROR] SaaS multi-tenant will NOT work without tenant ID!`);
        console.error(`[CRITICAL ERROR] Please login again or check backend response format.`);
        console.error(`[CRITICAL ERROR] Current auth state:`, {
          hasToken: !!token,
          hasUser: !!authState.user,
          userTenantId: authState.user?.tenantId,
          userTenant: authState.user?.tenant,
          localStorageTenantId: localStorage.getItem('tenantId'),
        });

        // Eğer kullanıcı bilgisi varsa, backend'den çekmeyi dene (async olarak)
        if (authState.user?.id && token) {
          console.warn(`[TENANT AUTO-FETCH] Attempting to fetch tenant ID from backend...`);
          // Async işlem - background'da çalıştır
          (async () => {
            try {
              const { fetchTenantIdFromBackend } = await import('@/utils/tenantUtils');
              const fetchedTenantId = await fetchTenantIdFromBackend();
              if (fetchedTenantId) {
                console.log(`[TENANT AUTO-FETCH] Successfully fetched tenant ID: ${fetchedTenantId}`);
                // Sonraki request'ler için tenant ID artık mevcut olacak
              }
            } catch (error) {
              console.error('[TENANT AUTO-FETCH] Failed to fetch tenant ID:', error);
            }
          })();
        }
      }
    }
  }

  return config;
});

// Response interceptor (handle errors)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Skip refresh for login/refresh endpoints to avoid infinite loop
    if (
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            const authState = useAuthStore.getState();
            originalRequest.headers.Authorization = `Bearer ${token}`;

            // Tenant ID'yi de ekle
            if (authState.tenantId) {
              originalRequest.headers[TENANT_HEADER_NAME] = authState.tenantId;
            }

            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await useAuthStore.getState().refreshToken();
        if (refreshed) {
          const authState = useAuthStore.getState();
          const token = authState.accessToken;
          const tenantId = authState.tenantId;

          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Tenant ID'yi de yeniden ekle
          if (tenantId) {
            originalRequest.headers[TENANT_HEADER_NAME] = tenantId;
          }

          isRefreshing = false;
          return api(originalRequest);
        } else {
          processQueue(error, null);
          isRefreshing = false;
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Henüz implement edilmemiş endpoint'ler için 404 hatalarını sessizce handle et
    const requestUrl = originalRequest?.url || '';
    const isUnimplementedEndpoint =
      requestUrl.includes('/api/analytics/') ||
      requestUrl.includes('analytics/dashboard') ||
      requestUrl.includes('analytics/revenue') ||
      requestUrl.includes('analytics/users-growth') ||
      requestUrl.includes('/api/subscriptions') ||
      requestUrl.includes('/api/plans');

    if (error.response?.status === 404 && isUnimplementedEndpoint) {
      // Bu endpoint'ler henüz implement edilmemiş olabilir
      // Sessizce boş bir response döndür (UI tarafında handle edilecek)
      return Promise.resolve({
        data: null,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: originalRequest,
      });
    }

    // Tüm hataları reject et (UI tarafında handle edilecek)
    // Console'a yazdırma işlemi main.tsx'deki filter tarafından yapılıyor
    return Promise.reject(error);
  }
);

export default api;

