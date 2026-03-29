import { invoke } from '@tauri-apps/api/core';

export async function exportCsv(
  dbId: string,
  query: string,
  path: string,
  delimiter?: string
): Promise<number> {
  return invoke<number>('export_csv', { dbId, query, path, delimiter });
}

export async function exportJson(
  dbId: string,
  query: string,
  path: string,
  format: 'array' | 'records'
): Promise<number> {
  return invoke<number>('export_json', { dbId, query, path, format });
}

export async function exportExcel(
  dbId: string,
  query: string,
  path: string
): Promise<number> {
  return invoke<number>('export_excel', { dbId, query, path });
}

export const exportService = {
  exportCsv,
  exportJson,
  exportExcel,
};
