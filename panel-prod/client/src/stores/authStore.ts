// Import storage polyfill first to ensure localStorage is available
import '@/lib/storage-polyfill';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  tenantId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  clearCache: () => void;
}

// Custom storage that handles environments where localStorage is not available
// Use lazy initialization to avoid storage access errors during SSR or in restricted contexts
let storageInstance: Storage | null = null;
let memoryStorage: Record<string, string> = {};
let memoryStorageInstance: Storage | null = null;
let storageType: 'localStorage' | 'memory' | null = null;

const getStorage = (): Storage => {
  // Return cached instance if already determined
  if (storageType === 'localStorage' && storageInstance) {
    return storageInstance;
  }
  if (storageType === 'memory') {
    // Return cached memory storage instance
    if (!memoryStorageInstance) {
      memoryStorageInstance = {
        getItem: (key: string) => {
          try {
            return memoryStorage[key] || null;
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            memoryStorage[key] = value;
          } catch {
            // Silently fail
          }
        },
        removeItem: (key: string) => {
          try {
            delete memoryStorage[key];
          } catch {
            // Silently fail
          }
        },
        clear: () => {
          try {
            memoryStorage = {};
          } catch {
            // Silently fail
          }
        },
        get length() {
          try {
            return Object.keys(memoryStorage).length;
          } catch {
            return 0;
          }
        },
        key: (index: number) => {
          try {
            return Object.keys(memoryStorage)[index] || null;
          } catch {
            return null;
          }
        },
      } as Storage;
    }
    return memoryStorageInstance;
  }

  // First time initialization
  if (typeof window === 'undefined') {
    storageType = 'memory';
    return getStorage();
  }

  // Try to use localStorage - wrap everything in try-catch for safety
  try {
    // Test if localStorage exists and is accessible
    if (window.localStorage && typeof window.localStorage.getItem === 'function') {
      const test = '__storage_test__';
      try {
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        storageInstance = window.localStorage;
        storageType = 'localStorage';
        return storageInstance;
      } catch (testError) {
        // Test failed, fall back to memory
        console.warn('[AuthStore] localStorage test failed, using memory storage');
      }
    }
  } catch (e) {
    // localStorage not accessible (e.g., in iframe sandbox, browser extension context)
    // Don't log in production to avoid console noise
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AuthStore] localStorage not accessible, using memory storage:', e);
    }
  }

  // Fallback to memory storage
  storageType = 'memory';
  return getStorage();
};

// Safe storage getter that never throws
const customStorage = () => {
  try {
    return getStorage();
  } catch (e) {
    // If storage initialization fails, return memory storage immediately
    if (!memoryStorageInstance) {
      memoryStorageInstance = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        get length() {
          return 0;
        },
        key: () => null,
      } as Storage;
    }
    return memoryStorageInstance;
  }
};

// Wrap store creation in try-catch to prevent blocking errors
let storeCreated = false;
let authStore: ReturnType<typeof create<AuthState>> | null = null;

try {
  authStore = create<AuthState>()(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        setAuth: (user, accessToken, refreshToken) => {
          // Save token and tenantId directly to localStorage for axios interceptor
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken || '');
              if (user?.tenantId) {
                localStorage.setItem('tenantId', user.tenantId);
              } else {
                localStorage.removeItem('tenantId');
              }
            } catch (e) {
              console.warn('[AuthStore] Failed to save tokens to localStorage:', e);
            }
          }
          set({ user, accessToken, refreshToken });
        },
        clearAuth: () => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('tenantId');
            } catch (e) {
              console.warn('[AuthStore] Failed to clear tokens from localStorage:', e);
            }
          }
          set({ user: null, accessToken: null, refreshToken: null });
        },
        isAuthenticated: () => !!get().accessToken,
        clearCache: () => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('auth-storage');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('tenantId');
            } catch (e) {
              console.warn('[AuthStore] Failed to clear cache from localStorage:', e);
            }
          }
          set({ user: null, accessToken: null, refreshToken: null });
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => customStorage()),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // Handle migration from version 0 to version 1
          // Version 1 includes the persist structure, so just return the state
          if (version < 1) {
            return {
              user: (persistedState as any)?.user ?? null,
              accessToken: (persistedState as any)?.accessToken ?? null,
              refreshToken: (persistedState as any)?.refreshToken ?? null,
            };
          }
          return persistedState;
        },
      }
    )
  );
  storeCreated = true;
} catch (error) {
  console.error('[AuthStore] Failed to create store, using fallback:', error);
  // Create a minimal fallback store without persist
  authStore = create<AuthState>()((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    setAuth: (user, accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken || '');
          if (user?.tenantId) {
            localStorage.setItem('tenantId', user.tenantId);
          } else {
            localStorage.removeItem('tenantId');
          }
        } catch (e) {
          // Ignore
        }
      }
      set({ user, accessToken, refreshToken });
    },
    clearAuth: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tenantId');
        } catch (e) {
          // Ignore
        }
      }
      set({ user: null, accessToken: null, refreshToken: null });
    },
    isAuthenticated: () => !!get().accessToken,
    clearCache: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tenantId');
        } catch (e) {
          // Ignore
        }
      }
      set({ user: null, accessToken: null, refreshToken: null });
    },
  }));
}

export const useAuthStore = authStore!;

