import { create } from 'zustand';
import * as editService from '@/services/edit';

interface PendingEdit {
  original: unknown;
  current: unknown;
}

interface EditState {
  pendingEdits: Map<string, PendingEdit>;
  selectedRows: Set<number>;
  isEditing: boolean;
  startEdit: (rowIdx: number, colName: string, value: unknown) => void;
  updateEdit: (rowIdx: number, colName: string, value: unknown) => void;
  commitEdit: (
    dbId: string,
    tableName: string,
    pkColumn: string,
    pkValue: unknown,
    column: string,
    value: unknown
  ) => Promise<void>;
  cancelEdit: (rowIdx: number, colName: string) => void;
  commitAllEdits: (
    dbId: string,
    tableName: string,
    pkColumn: string,
    rows: Record<string, unknown>[]
  ) => Promise<void>;
  toggleRowSelection: (rowIdx: number) => void;
  selectAllRows: (count: number) => void;
  clearSelection: () => void;
  hasUnsavedEdits: () => boolean;
}

function editKey(rowIdx: number, colName: string): string {
  return `${rowIdx}:${colName}`;
}

export const useEditStore = create<EditState>((set, get) => ({
  pendingEdits: new Map(),
  selectedRows: new Set(),
  isEditing: false,

  startEdit: (rowIdx, colName, value) => {
    set((state) => {
      const key = editKey(rowIdx, colName);
      const next = new Map(state.pendingEdits);
      if (!next.has(key)) {
        next.set(key, { original: value, current: value });
      }
      return { pendingEdits: next, isEditing: true };
    });
  },

  updateEdit: (rowIdx, colName, value) => {
    set((state) => {
      const key = editKey(rowIdx, colName);
      const existing = state.pendingEdits.get(key);
      if (!existing) return state;
      const next = new Map(state.pendingEdits);
      next.set(key, { ...existing, current: value });
      return { pendingEdits: next };
    });
  },

  commitEdit: async (dbId, tableName, pkColumn, pkValue, column, value) => {
    await editService.updateCell(dbId, tableName, pkColumn, pkValue, column, value);
    set((state) => {
      const next = new Map(state.pendingEdits);
      for (const [key] of next) {
        if (key.endsWith(`:${column}`)) {
          next.delete(key);
        }
      }
      return { pendingEdits: next, isEditing: next.size > 0 };
    });
  },

  cancelEdit: (rowIdx, colName) => {
    set((state) => {
      const key = editKey(rowIdx, colName);
      const next = new Map(state.pendingEdits);
      next.delete(key);
      return { pendingEdits: next, isEditing: next.size > 0 };
    });
  },

  commitAllEdits: async (dbId, tableName, pkColumn, rows) => {
    const edits = get().pendingEdits;
    const promises: Promise<void>[] = [];
    for (const [key, edit] of edits) {
      if (edit.original === edit.current) continue;
      const [rowIdxStr, colName] = key.split(':');
      const rowIdx = parseInt(rowIdxStr, 10);
      const row = rows[rowIdx];
      if (!row) continue;
      const pkValue = row[pkColumn];
      promises.push(
        editService
          .updateCell(dbId, tableName, pkColumn, pkValue, colName, edit.current)
          .then(() => undefined)
      );
    }
    await Promise.all(promises);
    set({ pendingEdits: new Map(), isEditing: false });
  },

  toggleRowSelection: (rowIdx) => {
    set((state) => {
      const next = new Set(state.selectedRows);
      if (next.has(rowIdx)) {
        next.delete(rowIdx);
      } else {
        next.add(rowIdx);
      }
      return { selectedRows: next };
    });
  },

  selectAllRows: (count) => {
    set(() => {
      const next = new Set<number>();
      for (let i = 0; i < count; i++) {
        next.add(i);
      }
      return { selectedRows: next };
    });
  },

  clearSelection: () => {
    set({ selectedRows: new Set() });
  },

  hasUnsavedEdits: () => {
    const edits = get().pendingEdits;
    for (const [, edit] of edits) {
      if (edit.original !== edit.current) return true;
    }
    return false;
  },
}));
