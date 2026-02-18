// Storage polyfill - must be imported before any code that uses localStorage
// This runs synchronously at module load time to ensure localStorage is available

if (typeof window !== 'undefined') {
  // Check if we need to polyfill localStorage
  let needsPolyfill = false;

  try {
    // Test if localStorage is accessible
    const testKey = '__storage_polyfill_test__';
    if (window.localStorage) {
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
    } else {
      needsPolyfill = true;
    }
  } catch (error) {
    // localStorage not accessible, need to polyfill
    needsPolyfill = true;
  }

  if (needsPolyfill) {
    // Create in-memory storage polyfill
    const store = new Map<string, string>();

    const memoryStorage: Storage = {
      get length() {
        return store.size;
      },
      clear() {
        store.clear();
      },
      getItem(key: string) {
        return store.has(key) ? store.get(key)! : null;
      },
      key(index: number) {
        return Array.from(store.keys())[index] ?? null;
      },
      removeItem(key: string) {
        store.delete(key);
      },
      setItem(key: string, value: string) {
        store.set(key, String(value));
      },
    };

    try {
      // @ts-ignore - Polyfill localStorage
      Object.defineProperty(window, 'localStorage', {
        value: memoryStorage,
        writable: true,
        configurable: true,
      });
      // @ts-ignore - Polyfill sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: memoryStorage,
        writable: true,
        configurable: true,
      });
    } catch (polyfillError) {
      // Silently fail - storage is not available in this context
    }
  }
}

