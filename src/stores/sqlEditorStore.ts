import { create } from 'zustand';
import type { QueryResult } from '@/types/query';
import * as queryService from '@/services/query';
import { useDatabaseStore } from '@/stores/databaseStore';

interface SqlTab {
  id: string;
  title: string;
  content: string;
  result: QueryResult | null;
  isExecuting: boolean;
  error: string | null;
  executionTime: number | null;
}

let tabCounter = 1;

function createDefaultTab(): SqlTab {
  return {
    id: crypto.randomUUID(),
    title: `Query ${tabCounter++}`,
    content: '',
    result: null,
    isExecuting: false,
    error: null,
    executionTime: null,
  };
}

interface SqlEditorState {
  tabs: SqlTab[];
  activeTabId: string;
  createTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  executeQuery: (tabId: string, sql?: string) => Promise<void>;
}

const initialTab = createDefaultTab();

export const useSqlEditorStore = create<SqlEditorState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,

  createTab: () => {
    const newTab = createDefaultTab();
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (id: string) => {
    set((state) => {
      const tabs = state.tabs.filter((t) => t.id !== id);
      if (tabs.length === 0) {
        const newTab = createDefaultTab();
        return { tabs: [newTab], activeTabId: newTab.id };
      }
      let activeTabId = state.activeTabId;
      if (activeTabId === id) {
        const closedIndex = state.tabs.findIndex((t) => t.id === id);
        activeTabId = tabs[Math.min(closedIndex, tabs.length - 1)].id;
      }
      return { tabs, activeTabId };
    });
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id });
  },

  updateContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, content } : t)),
    }));
  },

  executeQuery: async (tabId: string, sql?: string) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const activeDbId = useDatabaseStore.getState().activeDbId;
    if (!activeDbId) return;

    const queryText = sql ?? tab.content;
    if (!queryText.trim()) return;

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isExecuting: true, error: null, result: null, executionTime: null } : t
      ),
    }));

    const startTime = performance.now();
    try {
      const result = await queryService.executeQuery(activeDbId, queryText);
      const executionTime = performance.now() - startTime;
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, result, isExecuting: false, executionTime, error: null } : t
        ),
      }));
    } catch (e) {
      const executionTime = performance.now() - startTime;
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === tabId
            ? { ...t, isExecuting: false, error: (e as Error).message || String(e), executionTime }
            : t
        ),
      }));
    }
  },
}));
