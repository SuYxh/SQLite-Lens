import { invoke } from '@tauri-apps/api/core';

export async function updateCell(
  dbId: string,
  tableName: string,
  pkColumn: string,
  pkValue: unknown,
  column: string,
  value: unknown
): Promise<number> {
  return invoke<number>('update_cell', {
    dbId,
    tableName,
    pkColumn,
    pkValue,
    column,
    value,
  });
}

export async function insertRow(
  dbId: string,
  tableName: string,
  values: Record<string, unknown>
): Promise<number> {
  return invoke<number>('insert_row', {
    dbId,
    tableName,
    values,
  });
}

export async function deleteRows(
  dbId: string,
  tableName: string,
  pkColumn: string,
  pkValues: unknown[]
): Promise<number> {
  return invoke<number>('delete_rows', {
    dbId,
    tableName,
    pkColumn,
    pkValues,
  });
}

export const editService = {
  updateCell,
  insertRow,
  deleteRows,
};
