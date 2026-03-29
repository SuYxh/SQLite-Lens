import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  activeView: 'data' | 'sql' | 'structure';
  showWelcome: boolean;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  setActiveView: (view: 'data' | 'sql' | 'structure') => void;
  setShowWelcome: (show: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: 260,
  activeView: 'data',
  showWelcome: true,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarWidth: (w: number) => {
    set({ sidebarWidth: w });
  },

  setActiveView: (view) => {
    set({ activeView: view });
  },

  setShowWelcome: (show: boolean) => {
    set({ showWelcome: show });
  },
}));
