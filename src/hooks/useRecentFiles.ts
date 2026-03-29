import { useState, useCallback, useEffect } from 'react';
import type { RecentFile } from '@/types/config';
import * as configService from '@/services/config';

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const loadRecentFiles = useCallback(async () => {
    try {
      const files = await configService.getRecentFiles();
      setRecentFiles(files);
    } catch (_e) {
      setRecentFiles([]);
    }
  }, []);

  const clearRecentFiles = useCallback(async () => {
    try {
      await configService.clearRecentFiles();
      setRecentFiles([]);
    } catch (_e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadRecentFiles();
  }, [loadRecentFiles]);

  return { recentFiles, loadRecentFiles, clearRecentFiles };
}
