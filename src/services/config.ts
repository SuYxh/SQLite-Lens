import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, RecentFile } from '@/types/config';

export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>('get_config');
}

export async function setConfig(config: AppConfig): Promise<void> {
  return invoke<void>('set_config', { config });
}

export async function getRecentFiles(): Promise<RecentFile[]> {
  return invoke<RecentFile[]>('get_recent_files');
}

export async function addRecentFile(file: RecentFile): Promise<void> {
  return invoke<void>('add_recent_file', { file });
}

export async function clearRecentFiles(): Promise<void> {
  return invoke<void>('clear_recent_files');
}

export const configService = {
  getConfig,
  setConfig,
  getRecentFiles,
  addRecentFile,
  clearRecentFiles,
};
