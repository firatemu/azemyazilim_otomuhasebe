import { create } from 'zustand';

export interface Tab {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

interface TabState {
  tabs: Tab[];
  activeTab: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  clearTabs: () => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTab: '',

  addTab: (tab) => {
    const { tabs } = get();
    const existingTab = tabs.find((t) => t.id === tab.id);

    if (!existingTab) {
      set({ tabs: [...tabs, tab], activeTab: tab.id });
    } else {
      set({ activeTab: tab.id });
    }
  },

  removeTab: (tabId) => {
    const { tabs, activeTab } = get();
    const newTabs = tabs.filter((t) => t.id !== tabId);

    if (newTabs.length === 0) {
      // Clear all tabs when last tab is closed
      set({
        tabs: [],
        activeTab: '',
      });
      return;
    }

    let newActiveTab = activeTab;
    if (activeTab === tabId) {
      const index = tabs.findIndex((t) => t.id === tabId);
      newActiveTab = newTabs[Math.max(0, index - 1)].id;
    }

    set({ tabs: newTabs, activeTab: newActiveTab });
  },

  setActiveTab: (tabId) => set({ activeTab: tabId }),

  clearTabs: () => set({
    tabs: [],
    activeTab: ''
  }),
}));

