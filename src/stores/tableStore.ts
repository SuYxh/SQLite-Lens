import { create } from 'zustand';
import type { SortColumn, FilterCondition, Value } from '@/types/query';
import * as queryService from '@/services/query';
import { useDatabaseStore } from '@/stores/databaseStore';

interface TableState {
  activeTable: string | null;
  data: Value[][];
  columns: string[];
  totalRows: number;
  page: number;
  pageSize: number;
  sortColumns: SortColumn[];
  filters: FilterCondition[];
  isLoading: boolean;
  selectTable: (tableName: string) => Promise<void>;
  fetchData: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  toggleSort: (column: string) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (column: string) => void;
  clearFilters: () => void;
  reset: () => void;
}

export const useTableStore = create<TableState>((set, get) => ({
  activeTable: null,
  data: [],
  columns: [],
  totalRows: 0,
  page: 0,
  pageSize: 100,
  sortColumns: [],
  filters: [],
  isLoading: false,

  selectTable: async (tableName: string) => {
    set({
      activeTable: tableName,
      page: 0,
      sortColumns: [],
      filters: [],
    });
    await get().fetchData();
  },

  fetchData: async () => {
    const { activeTable, page, pageSize, sortColumns, filters } = get();
    const activeDbId = useDatabaseStore.getState().activeDbId;
    if (!activeDbId || !activeTable) return;

    set({ isLoading: true });
    try {
      const result = await queryService.getTableData(activeDbId, {
        table_name: activeTable,
        page,
        page_size: pageSize,
        sort_columns: sortColumns,
        filters,
      });
      set({
        data: result.rows,
        columns: result.columns,
        totalRows: result.total_rows,
        isLoading: false,
      });
    } catch (_e) {
      set({ isLoading: false });
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchData();
  },

  setPageSize: (size: number) => {
    set({ pageSize: size, page: 0 });
    get().fetchData();
  },

  toggleSort: (column: string) => {
    set((state) => {
      const existing = state.sortColumns.find((s) => s.column === column);
      let sortColumns: SortColumn[];
      if (!existing) {
        sortColumns = [...state.sortColumns, { column, direction: 'Asc' }];
      } else if (existing.direction === 'Asc') {
        sortColumns = state.sortColumns.map((s) =>
          s.column === column ? { ...s, direction: 'Desc' as const } : s
        );
      } else {
        sortColumns = state.sortColumns.filter((s) => s.column !== column);
      }
      return { sortColumns };
    });
    get().fetchData();
  },

  addFilter: (filter: FilterCondition) => {
    set((state) => ({
      filters: [...state.filters, filter],
      page: 0,
    }));
    get().fetchData();
  },

  removeFilter: (column: string) => {
    set((state) => ({
      filters: state.filters.filter((f) => f.column !== column),
      page: 0,
    }));
    get().fetchData();
  },

  clearFilters: () => {
    set({ filters: [], page: 0 });
    get().fetchData();
  },

  reset: () => {
    set({
      activeTable: null,
      data: [],
      columns: [],
      totalRows: 0,
      page: 0,
      pageSize: 100,
      sortColumns: [],
      filters: [],
      isLoading: false,
    });
  },
}));
