import { open } from '@tauri-apps/plugin-dialog';
import { useDatabaseStore } from '@/stores/databaseStore';

export function useDatabase() {
  const isLoading = useDatabaseStore((s) => s.isLoading);
  const error = useDatabaseStore((s) => s.error);
  const databases = useDatabaseStore((s) => s.databases);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const activeDatabase = databases.find((db) => db.id === activeDbId) ?? null;

  const openFileDialog = async () => {
    const filePath = await open({
      multiple: false,
      filters: [
        {
          name: 'SQLite Database',
          extensions: ['db', 'sqlite', 'sqlite3', 'db3'],
        },
      ],
    });
    if (filePath) {
      await useDatabaseStore.getState().openDatabase(filePath);
    }
  };

  return { openFileDialog, isLoading, error, databases, activeDatabase };
}
