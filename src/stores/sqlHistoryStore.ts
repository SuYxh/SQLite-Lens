import { create } from 'zustand';

export interface SqlHistoryEntry {
  id: string;
  sql: string;
  executedAt: string;
  executionTimeMs: number;
  rowsAffected: number;
  isSelect: boolean;
}

const MAX_HISTORY = 500;

interface SqlHistoryState {
  history: SqlHistoryEntry[];
  addEntry: (entry: Omit<SqlHistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  searchHistory: (query: string) => SqlHistoryEntry[];
}

export const useSqlHistoryStore = create<SqlHistoryState>((set, get) => ({
  history: [],

  addEntry: (entry) => {
    const newEntry: SqlHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    set((state) => {
      const updated = [newEntry, ...state.history];
      if (updated.length > MAX_HISTORY) {
        updated.length = MAX_HISTORY;
      }
      return { history: updated };
    });
  },

  clearHistory: () => {
    set({ history: [] });
  },

  searchHistory: (query: string) => {
    const lower = query.toLowerCase();
    return get().history.filter((entry) =>
      entry.sql.toLowerCase().includes(lower)
    );
  },
}));
