import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './utils/cacheBuster'; // Cache buster'ı import et
import './utils/assignTenantIds'; // Tenant ID atama utility'si
import './utils/cleanupUsers'; // Kullanıcı temizleme ve test utility'si

// ============================================
// CONSOLE ERROR/WARNING FILTER
// External script hatalarını ve gereksiz uyarıları filtreler
// ============================================

const originalError = console.error;
const originalWarn = console.warn;

// Filtrelenecek pattern'ler (case-insensitive)
const filterPatterns = [
  'feature_collector.js',
  'installHook.js',
  'overrideMethod',
  'using deprecated parameters for the initialization function',
  'pass a single object instead',
  'Stok verisi alınamadı',
  'Raf listesi alınamadı',
  'Çek/Senet hatırlatıcıları yüklenemedi',
  'Hatırlatıcılar yüklenirken hata',
  'Malzeme kaydedilemedi',
  'Backend hatası',
  'Request failed with status code 500',
  'Request failed with status code 400',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'Internal Server Error',
  'Bad Request',
];

// API endpoint'leri için filtreleme (500, 400 hatalarını sessizce handle et)
const silentErrorEndpoints = [
  '/api/stok',
  '/api/location',
  '/api/code-template',
  '/api/cek-senet',
  '/api/personel',
];

// String veya object içinde pattern arama
const shouldFilter = (args: any[]): boolean => {
  const message = args
    .map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (arg?.toString) return arg.toString();
      return JSON.stringify(arg);
    })
    .join(' ')
    .toLowerCase();

  return filterPatterns.some(pattern => 
    message.includes(pattern.toLowerCase())
  );
};

// Console.error override - External script hatalarını ve 500/400 network hatalarını filtrele
console.error = (...args: any[]) => {
  // Tüm argümanları string'e çevir ve birleştir
  const fullMessage = args
    .map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (arg?.stack) return arg.stack; // Stack trace'i de kontrol et
      if (arg?.toString) return arg.toString();
      return JSON.stringify(arg);
    })
    .join(' ')
    .toLowerCase();
  
  // feature_collector.js ile ilgili tüm hataları filtrele
  const isFeatureCollectorError = 
    fullMessage.includes('feature_collector') ||
    fullMessage.includes('feature_collector.js');
  
  // installHook.js ile ilgili tüm hataları filtrele
  const isInstallHookError = 
    fullMessage.includes('installhook') ||
    fullMessage.includes('installhook.js') ||
    fullMessage.includes('overridemethod');
  
  // 500/400/404 network hatalarını filtrele (bunlar tenant ID eksikliğinden veya eksik endpoint'lerden kaynaklanıyor olabilir)
  const isNetworkError = 
    fullMessage.includes('500 (internal server error)') ||
    fullMessage.includes('400 (bad request)') ||
    fullMessage.includes('404 (not found)') ||
    fullMessage.includes('request failed with status code 500') ||
    fullMessage.includes('request failed with status code 400') ||
    fullMessage.includes('request failed with status code 404') ||
    fullMessage.includes('err_bad_response') ||
    fullMessage.includes('err_bad_request') ||
    (args.some(arg => {
      if (typeof arg === 'string') {
        return arg.includes('500') || arg.includes('400') || arg.includes('404');
      }
      if (arg?.message) {
        return arg.message.includes('500') || arg.message.includes('400') || arg.message.includes('404');
      }
      if (arg?.response?.status) {
        return arg.response.status === 404 || arg.response.status === 400 || arg.response.status === 500;
      }
      return false;
    }) && fullMessage.includes('api.otomuhasebe.com'));
  
  // Backend hata mesajlarını filtrele
  const isBackendErrorMessage = 
    fullMessage.includes('çek/senet hatırlatıcıları yüklenemedi') ||
    fullMessage.includes('hatırlatıcılar yüklenirken hata') ||
    fullMessage.includes('stok verisi alınamadı') ||
    fullMessage.includes('raf listesi alınamadı') ||
    fullMessage.includes('malzeme kaydedilemedi') ||
    fullMessage.includes('backend hatası');
  
  // Henüz implement edilmemiş endpoint'ler için 404 hatalarını filtrele
  const isUnimplementedEndpoint404 = 
    fullMessage.includes('/api/analytics/') ||
    fullMessage.includes('analytics/dashboard') ||
    fullMessage.includes('analytics/revenue') ||
    fullMessage.includes('analytics/users-growth') ||
    fullMessage.includes('/api/subscriptions') ||
    fullMessage.includes('/api/plans') ||
    fullMessage.includes('/api/users?search=');
  
  // CRITICAL ERROR mesajlarını ASLA filtreleme (tenant ID sorunları için önemli)
  const isCriticalError = fullMessage.includes('[critical error]');
  
  if ((isFeatureCollectorError || isInstallHookError || isNetworkError || isBackendErrorMessage || isUnimplementedEndpoint404) && !isCriticalError) {
    return; // Suppress external script errors, network errors, and unimplemented endpoint 404s, but NOT critical errors
  }
  
  originalError.apply(console, args);
};

// Console.warn override - SADECE external script uyarılarını filtrele
console.warn = (...args: any[]) => {
  // Tüm argümanları string'e çevir ve birleştir
  const fullMessage = args
    .map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (arg?.stack) return arg.stack; // Stack trace'i de kontrol et
      if (arg?.toString) return arg.toString();
      return JSON.stringify(arg);
    })
    .join(' ')
    .toLowerCase();
  
  // feature_collector.js ile ilgili tüm uyarıları filtrele
  // Stack trace'de feature_collector.js varsa da filtrele
  const hasFeatureCollectorInStack = args.some(arg => {
    if (typeof arg === 'string') {
      return arg.toLowerCase().includes('feature_collector');
    }
    if (arg?.stack) {
      return arg.stack.toLowerCase().includes('feature_collector');
    }
    if (arg?.toString) {
      return arg.toString().toLowerCase().includes('feature_collector');
    }
    return false;
  });
  
  // "deprecated parameters" uyarısını her zaman filtrele (feature_collector.js'den geliyor)
  // Bu uyarı genellikle browser extension'lardan geliyor ve uygulama ile ilgili değil
  const isDeprecatedParamsWarning = 
    fullMessage.includes('deprecated parameters') || 
    fullMessage.includes('using deprecated') ||
    fullMessage.includes('pass a single object') ||
    fullMessage.includes('initialization function');
  
  const isFeatureCollectorWarning = 
    fullMessage.includes('feature_collector') ||
    fullMessage.includes('feature_collector.js') ||
    hasFeatureCollectorInStack ||
    isDeprecatedParamsWarning; // Tüm deprecated parameters uyarılarını filtrele
  
  // installHook.js ile ilgili tüm uyarıları filtrele
  const isInstallHookWarning = 
    fullMessage.includes('installhook') ||
    fullMessage.includes('installhook.js') ||
    fullMessage.includes('overridemethod');
  
  if (isFeatureCollectorWarning || isInstallHookWarning) {
    return; // Suppress external script warnings
  }
  
  originalWarn.apply(console, args);
};

// Global error handler - window.onerror
const originalWindowError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  const errorMessage = String(message || '').toLowerCase();
  const sourceFile = String(source || '').toLowerCase();
  const errorStack = error?.stack?.toLowerCase() || '';
  
  // feature_collector.js ile ilgili tüm hataları filtrele
  const isFeatureCollectorError = 
    errorMessage.includes('feature_collector') ||
    sourceFile.includes('feature_collector') ||
    errorStack.includes('feature_collector');
  
  // installHook.js ile ilgili tüm hataları filtrele
  const isInstallHookError = 
    errorMessage.includes('installhook') ||
    sourceFile.includes('installhook') ||
    errorStack.includes('installhook');
  
  // Henüz implement edilmemiş endpoint'ler için 404 hatalarını filtrele
  const isUnimplementedEndpoint404 = 
    errorMessage.includes('/api/analytics/') ||
    errorMessage.includes('analytics/dashboard') ||
    errorMessage.includes('analytics/revenue') ||
    errorMessage.includes('analytics/users-growth') ||
    errorMessage.includes('/api/subscriptions') ||
    errorMessage.includes('/api/plans') ||
    errorMessage.includes('/api/users?search=') ||
    sourceFile.includes('/api/analytics/') ||
    sourceFile.includes('/api/subscriptions') ||
    sourceFile.includes('/api/plans');
  
  // Network hatalarını filtrele (404, 400, 500)
  const isNetworkError = 
    errorMessage.includes('404') ||
    errorMessage.includes('400') ||
    errorMessage.includes('500') ||
    errorMessage.includes('not found') ||
    errorMessage.includes('bad request') ||
    errorMessage.includes('internal server error');
  
  if (isFeatureCollectorError || isInstallHookError || isUnimplementedEndpoint404 || isNetworkError) {
    return true; // Error handled, don't show in console
  }
  
  // Orijinal handler'ı çağır
  if (originalWindowError) {
    return originalWindowError(message, source, lineno, colno, error);
  }
  return false;
};

// Unhandled promise rejection handler - SADECE external script hatalarını filtrele
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason || '').toLowerCase();
  const stack = reason?.stack?.toLowerCase() || '';
  const fullMessage = (message + ' ' + stack).toLowerCase();
  
  // feature_collector.js ile ilgili tüm rejection'ları filtrele
  const isFeatureCollectorError = 
    fullMessage.includes('feature_collector') ||
    fullMessage.includes('feature_collector.js');
  
  // installHook.js ile ilgili tüm rejection'ları filtrele
  const isInstallHookError = 
    fullMessage.includes('installhook') ||
    fullMessage.includes('installhook.js') ||
    fullMessage.includes('overridemethod');
  
  // Henüz implement edilmemiş endpoint'ler için 404 hatalarını filtrele
  const isUnimplementedEndpoint404 = 
    fullMessage.includes('/api/analytics/') ||
    fullMessage.includes('analytics/dashboard') ||
    fullMessage.includes('analytics/revenue') ||
    fullMessage.includes('analytics/users-growth') ||
    fullMessage.includes('/api/subscriptions') ||
    fullMessage.includes('/api/plans') ||
    fullMessage.includes('/api/users?search=');
  
  // Network hatalarını filtrele (404, 400, 500)
  const isNetworkError = 
    fullMessage.includes('404') ||
    fullMessage.includes('400') ||
    fullMessage.includes('500') ||
    fullMessage.includes('not found') ||
    fullMessage.includes('bad request') ||
    fullMessage.includes('internal server error');
  
  if (isFeatureCollectorError || isInstallHookError || isUnimplementedEndpoint404 || isNetworkError) {
    event.preventDefault(); // Prevent default console error
    return;
  }
  
  // Uygulama hatalarını göster (React Query, API hataları vb.)
});

// XMLHttpRequest override - SADECE console hatalarını filtrele, event'leri engelleme
// NOT: XMLHttpRequest override'ı kaldırıldı çünkü event handler'ları engelliyordu
// Network hataları console.error filter tarafından zaten filtreleniyor

// Network hatası filtreleme fonksiyonu - SADECE console mesajları için kullanılır
// NOT: Bu fonksiyon artık kullanılmıyor, sadece referans için bırakıldı

// Fetch override - SADECE console hatalarını filtrele, response'ları engelleme
// NOT: Fetch override'ı kaldırıldı çünkü response'ları engelliyordu
// Network hataları console.error filter tarafından zaten filtreleniyor

// Cache'leri temizle
if ((import.meta as any).env?.DEV) {
  console.log('[DEV MODE] Cache buster active - All caches will be cleared');
}

// Global debug fonksiyonları (browser console'dan erişilebilir)
// Bu fonksiyonlar hemen tanımlanır, böylece build sonrası da çalışır
declare global {
  interface Window {
    checkUserTenant: (email: string) => Promise<void>;
    debugTenant: () => void;
    getCurrentTenantId: () => Promise<string | null>;
  }
}

// @ts-ignore
window.checkUserTenant = async (email: string) => {
  try {
    const { checkUserTenantId } = await import('@/utils/tenantUtils');
    await checkUserTenantId(email);
  } catch (error) {
    originalError('Error loading tenant utils:', error);
  }
};

// @ts-ignore
window.debugTenant = () => {
  import('@/utils/tenantUtils').then(({ debugTenantInfo }) => {
    debugTenantInfo();
  }).catch((error) => {
    originalError('Error loading tenant utils:', error);
  });
};

// @ts-ignore
window.getCurrentTenantId = async () => {
  try {
    const { getCurrentTenantId } = await import('@/utils/tenantUtils');
    const tenantId = getCurrentTenantId();
    console.log('Current Tenant ID:', tenantId);
    return tenantId;
  } catch (error) {
    originalError('Error loading tenant utils:', error);
    return null;
  }
};

// Uygulama başlangıcında tenant ID'yi kontrol et ve yükle
(async () => {
  try {
    const { useAuthStore } = await import('@/stores/authStore');
    const { ensureTenantId, fetchTenantIdFromBackend } = await import('@/utils/tenantUtils');
    
    const authState = useAuthStore.getState();
    
    // Eğer kullanıcı giriş yapmışsa tenant ID'yi kontrol et
    if (authState.isAuthenticated && authState.accessToken) {
      // Önce mevcut tenant ID'yi kontrol et
      if (!ensureTenantId()) {
        // Tenant ID yoksa backend'den çek
        console.log('[APP INIT] Tenant ID not found, fetching from backend...');
        await fetchTenantIdFromBackend();
      } else {
        console.log('[APP INIT] Tenant ID found:', useAuthStore.getState().tenantId);
      }
    }
  } catch (error) {
    console.error('[APP INIT] Error checking tenant ID:', error);
  }
})();

// Dark mode initialization - sistem temasına göre .dark sınıfı ekle
if (typeof window !== 'undefined') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
