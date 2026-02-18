/**
 * Uygulama Sabit Yapılandırması
 * Tüm port numaraları ve API URL'leri burada sabit olarak tanımlanmıştır.
 * Bu dosya asla değiştirilmemelidir - tüm API ve port yönlendirmeleri buradan yönetilir.
 */

// API Base URL - SABİT (asla değişmemeli)
export const API_BASE_URL = 'https://api.otomuhasebe.com/api';

// Alternatif API URL'leri (gerekirse)
export const API_URLS = {
  PRODUCTION: 'https://api.otomuhasebe.com/api',
  STAGING: 'https://staging-api.otomuhasebe.com/api',
  DEVELOPMENT: 'https://api.otomuhasebe.com/api',
} as const;

// Development Server Port - SABİT (asla değişmemeli)
export const DEV_SERVER_PORT = 3001;

// Preview Server Port - SABİT (asla değişmemeli)
export const PREVIEW_SERVER_PORT = 3001;

// API Timeout - SABİT
export const API_TIMEOUT = 30000; // 30 saniye

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: '/users',
  PLANS: '/plans',
  PAYMENTS: '/payments',
  SUBSCRIPTIONS: '/subscriptions',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  CEK_SENET: '/cek-senet',
  PERSONEL: '/personel',
  STOK: '/stok',
  LOCATION: '/location',
  CODE_TEMPLATE: '/code-template',
} as const;

// SaaS Multi-Tenant Configuration
// Backend'in beklediği tenant ID header adı
// Eğer backend farklı bir header adı bekliyorsa burayı değiştirin
// Yaygın kullanılan formatlar:
// - 'X-Tenant-Id' (varsayılan)
// - 'Tenant-Id'
// - 'X-Tenant-ID'
// - 'x-tenant-id'
// - 'X-TenantID'
export const TENANT_HEADER_NAME = 'X-Tenant-Id';

// Alternatif header formatları (fallback için)
// Eğer backend birden fazla header formatını kabul ediyorsa buraya ekleyin
export const ALTERNATIVE_TENANT_HEADERS = [
  'Tenant-Id',
  'X-Tenant-ID',
  'x-tenant-id',
  'X-TenantID',
] as const;

/**
 * Ana API Base URL'ini döndürür
 * Environment variable varsa onu kullanır, yoksa sabit değeri kullanır
 * Ancak her durumda sabit bir değer garantisi vardır
 */
export const getApiBaseUrl = (): string => {
  // Environment variable kontrolü (opsiyonel override)
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  
  // Eğer environment variable varsa ve geçerliyse kullan
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    // URL'in sonunda /api varsa kaldır (baseURL zaten /api içeriyor)
    const cleanUrl = envUrl.trim().replace(/\/api\/?$/, '');
    return `${cleanUrl}/api`;
  }
  
  // Varsayılan olarak sabit production URL'i kullan
  return API_BASE_URL;
};

/**
 * Development server port numarasını döndürür
 * Her zaman sabit değeri döndürür
 */
export const getDevServerPort = (): number => {
  return DEV_SERVER_PORT;
};

/**
 * Preview server port numarasını döndürür
 * Her zaman sabit değeri döndürür
 */
export const getPreviewServerPort = (): number => {
  return PREVIEW_SERVER_PORT;
};

