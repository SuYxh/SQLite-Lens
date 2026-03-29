import { invoke } from '@tauri-apps/api/core';
import type { QueryResult, TableDataParams, TableDataResult } from '@/types/query';

export async function executeQuery(dbId: string, sql: string): Promise<QueryResult> {
  return invoke<QueryResult>('execute_query', { dbId, sql });
}

export async function getTableData(dbId: string, params: TableDataParams): Promise<TableDataResult> {
  return invoke<TableDataResult>('get_table_data', { dbId, params });
}

export const queryService = {
  executeQuery,
  getTableData,
};
