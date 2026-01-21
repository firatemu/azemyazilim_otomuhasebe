import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          // Update document class for CSS
          if (typeof document !== 'undefined') {
            if (newDarkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { isDarkMode: newDarkMode };
        }),
      setDarkMode: (isDark: boolean) =>
        set(() => {
          // Update document class for CSS
          if (typeof document !== 'undefined') {
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { isDarkMode: isDark };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
