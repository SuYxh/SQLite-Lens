import { invoke } from '@tauri-apps/api/core';
import type { DatabaseInfo, SchemaInfo } from '@/types/database';

export async function openDatabase(filePath: string): Promise<DatabaseInfo> {
  return invoke<DatabaseInfo>('open_database', { filePath });
}

export async function closeDatabase(dbId: string): Promise<void> {
  return invoke<void>('close_database', { dbId });
}

export async function getSchema(dbId: string): Promise<SchemaInfo> {
  return invoke<SchemaInfo>('get_schema', { dbId });
}

export const databaseService = {
  openDatabase,
  closeDatabase,
  getSchema,
};
