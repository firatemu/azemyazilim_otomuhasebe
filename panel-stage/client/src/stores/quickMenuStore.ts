import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getParameter, updateParameter } from '@/services/systemParameterService';

export interface QuickMenuItem {
  id: string;
  label: string;
  icon: string; // Material-UI icon name
  path: string;
  color: string;
  enabled: boolean;
  order: number;
}

interface QuickMenuState {
  items: QuickMenuItem[];
  isLoading: boolean;
  fetchQuickMenuItems: () => Promise<void>;
  addQuickMenuItem: (item: Omit<QuickMenuItem, 'id' | 'order'>) => Promise<void>;
  updateQuickMenuItem: (id: string, updates: Partial<QuickMenuItem>) => Promise<void>;
  deleteQuickMenuItem: (id: string) => Promise<void>;
  reorderQuickMenuItems: (items: QuickMenuItem[]) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  setQuickMenuItems: (items: QuickMenuItem[]) => void;
}

const QUICK_MENU_KEY = 'QUICK_MENU_ITEMS';

const defaultQuickMenuItems: QuickMenuItem[] = [
  {
    id: 'quick-fatura',
    label: 'Yeni Fatura',
    icon: 'Receipt',
    path: '/fatura/satis',
    color: '#8b5cf6',
    enabled: true,
    order: 0,
  },
  {
    id: 'quick-cari',
    label: 'Yeni Cari',
    icon: 'People',
    path: '/cari',
    color: '#527575',
    enabled: true,
    order: 1,
  },
  {
    id: 'quick-stok',
    label: 'Yeni Stok',
    icon: 'Inventory',
    path: '/stok/malzeme-listesi',
    color: '#06b6d4',
    enabled: true,
    order: 2,
  },
];

export const useQuickMenuStore = create<QuickMenuState>()(
  persist(
    (set, get) => ({
      items: defaultQuickMenuItems,
      isLoading: false,

      fetchQuickMenuItems: async () => {
        set({ isLoading: true });
        try {
          const remoteItems = await getParameter(QUICK_MENU_KEY);
          if (remoteItems && Array.isArray(remoteItems)) {
            set({ items: remoteItems });
          }
        } catch (error) {
          console.error('Hızlı menü yüklenemedi:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addQuickMenuItem: async (item) => {
        const { items } = get();
        const newId = `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const maxOrder = Math.max(...items.map((i) => i.order), 0);

        const newItems = [
          ...items,
          {
            ...item,
            id: newId,
            order: maxOrder + 1,
          },
        ];

        set({ items: newItems });
        try {
          await updateParameter(QUICK_MENU_KEY, { value: newItems, category: 'QUICK_MENU' });
        } catch (error) {
          console.error('Hızlı menü kaydedilirken hata:', error);
        }
      },

      updateQuickMenuItem: async (id, updates) => {
        const { items } = get();
        const newItems = items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        set({ items: newItems });
        try {
          await updateParameter(QUICK_MENU_KEY, { value: newItems, category: 'QUICK_MENU' });
        } catch (error) {
          console.error('Hızlı menü güncellenirken hata:', error);
        }
      },

      deleteQuickMenuItem: async (id) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== id);
        set({ items: newItems });
        try {
          await updateParameter(QUICK_MENU_KEY, { value: newItems, category: 'QUICK_MENU' });
        } catch (error) {
          console.error('Hızlı menü silinirken hata:', error);
        }
      },

      reorderQuickMenuItems: async (newItems) => {
        const itemsWithOrder = newItems.map((item, index) => ({ ...item, order: index }));
        set({ items: itemsWithOrder });
        try {
          await updateParameter(QUICK_MENU_KEY, { value: itemsWithOrder, category: 'QUICK_MENU' });
        } catch (error) {
          console.error('Hızlı menü sıralanırken hata:', error);
        }
      },

      resetToDefaults: async () => {
        set({ items: defaultQuickMenuItems });
        try {
          await updateParameter(QUICK_MENU_KEY, { value: defaultQuickMenuItems, category: 'QUICK_MENU' });
        } catch (error) {
          console.error('Hızlı menü sıfırlanırken hata:', error);
        }
      },

      setQuickMenuItems: (items) => {
        set({ items });
      },
    }),
    {
      name: 'quick-menu-storage',
    }
  )
);
