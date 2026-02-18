/**
 * Cache buster utility - Tarayıcı cache'ini temizlemek için
 * Her uygulama başlangıcında çalışır
 */

export function clearAllCaches() {
  // Service Worker'ları kaldır
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }

  // Cache API'yi temizle
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }

  // IndexedDB cache'lerini temizle (eğer kullanılıyorsa)
  if ('indexedDB' in window) {
    // IndexedDB temizliği için gerekirse eklenebilir
  }

  // Version kontrolü ile localStorage temizleme
  const CACHE_VERSION = Date.now().toString();
  const storedVersion = localStorage.getItem('app_cache_version');
  
  if (!storedVersion || storedVersion !== CACHE_VERSION) {
    // Eski cache'i temizle
    const keysToKeep = ['app_cache_version', 'user', 'accessToken', 'refreshToken'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    localStorage.setItem('app_cache_version', CACHE_VERSION);
  }

  console.log('[Cache Buster] All caches cleared at:', new Date().toISOString());
}

// Uygulama başlangıcında cache'leri temizle
if (typeof window !== 'undefined') {
  clearAllCaches();
  
  // Her sayfa yüklemesinde de temizle (dev mode için)
  if ((import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development') {
    // Her sayfa yüklemesinde cache temizle
    window.addEventListener('beforeunload', () => {
      clearAllCaches();
    });
    
    // Her 5 saniyede bir cache kontrolü yap (dev mode için)
    setInterval(() => {
      const currentVersion = Date.now().toString();
      const storedVersion = localStorage.getItem('app_cache_version');
      
      if (!storedVersion || storedVersion !== currentVersion) {
        console.log('[Cache Buster] Cache version mismatch detected, clearing caches...');
        clearAllCaches();
      }
    }, 5000);
    
    // Service Worker değişikliklerini dinle
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Cache Buster] Service Worker changed, clearing caches...');
        clearAllCaches();
        window.location.reload();
      });
    }
    
    // Console'a cache temizleme komutu ekle
    (window as any).clearCache = () => {
      clearAllCaches();
      window.location.reload();
    };
    
    console.log('[Cache Buster] Developer mode active - Cache clearing enabled');
    console.log('[Cache Buster] Use window.clearCache() to manually clear cache');
  }
}

