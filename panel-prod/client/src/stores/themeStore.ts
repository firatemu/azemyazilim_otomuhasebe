import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const newIsDark = !state.isDarkMode;
          // Update HTML class
          if (typeof window !== 'undefined') {
            if (newIsDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { isDarkMode: newIsDark };
        }),
      setDarkMode: (isDark) =>
        set(() => {
          // Update HTML class
          if (typeof window !== 'undefined') {
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
