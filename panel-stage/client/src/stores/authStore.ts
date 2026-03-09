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
  hydrateAuth: (user: User | null, accessToken: string | null, refreshToken: string | null) => void;
}

// Memory fallback storage
let memoryStorage: Record<string, string> = {};
const memoryStorageInstance: Storage = {
  getItem: (key) => memoryStorage[key] || null,
  setItem: (key, value) => { memoryStorage[key] = value; },
  removeItem: (key) => { delete memoryStorage[key]; },
  clear: () => { memoryStorage = {}; },
  length: 0,
  key: (i) => Object.keys(memoryStorage)[i] || null,
};

const getStorage = (): Storage => {
  if (typeof window === 'undefined') return memoryStorageInstance;
  try {
    const test = '__test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return window.localStorage;
  } catch (e) {
    return memoryStorageInstance;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken || '');
            if (user?.tenantId) localStorage.setItem('tenantId', user.tenantId);
          } catch (e) { }
        }
        set({ user, accessToken, refreshToken });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tenantId');
          } catch (e) { }
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
          } catch (e) { }
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
      hydrateAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage()),
      version: 1,
    }
  )
);
