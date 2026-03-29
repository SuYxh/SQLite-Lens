import { create } from 'zustand';
import type { DatabaseInfo } from '@/types/database';
import * as databaseService from '@/services/database';
import * as configService from '@/services/config';

interface DatabaseState {
  databases: DatabaseInfo[];
  activeDbId: string | null;
  isLoading: boolean;
  error: string | null;
  openDatabase: (filePath: string) => Promise<void>;
  closeDatabase: (id: string) => Promise<void>;
  setActiveDatabase: (id: string) => void;
  refreshSchema: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDatabaseStore = create<DatabaseState>((set) => ({
  databases: [],
  activeDbId: null,
  isLoading: false,
  error: null,

  openDatabase: async (filePath: string) => {
    set({ isLoading: true, error: null });
    try {
      const dbInfo = await databaseService.openDatabase(filePath);
      const schema = await databaseService.getSchema(dbInfo.id);
      set((state) => ({
        databases: [...state.databases, { ...dbInfo, schema }],
        activeDbId: dbInfo.id,
        isLoading: false,
      }));
      await configService.addRecentFile({
        path: dbInfo.file_path,
        name: dbInfo.file_name,
        size: dbInfo.file_size,
        last_opened: new Date().toISOString(),
      });
    } catch (e) {
      set({ error: (e as Error).message || String(e), isLoading: false });
    }
  },

  closeDatabase: async (id: string) => {
    try {
      await databaseService.closeDatabase(id);
      set((state) => {
        const databases = state.databases.filter((db) => db.id !== id);
        let activeDbId = state.activeDbId;
        if (activeDbId === id) {
          activeDbId = databases.length > 0 ? databases[0].id : null;
        }
        return { databases, activeDbId };
      });
    } catch (e) {
      set({ error: (e as Error).message || String(e) });
    }
  },

  setActiveDatabase: (id: string) => {
    set({ activeDbId: id });
  },

  refreshSchema: async (id: string) => {
    try {
      const schema = await databaseService.getSchema(id);
      set((state) => ({
        databases: state.databases.map((db) =>
          db.id === id ? { ...db, schema } : db
        ),
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e) });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
