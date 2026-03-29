import { Database, FolderOpen } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useRecentFiles } from '@/hooks/useRecentFiles';
import RecentFiles from './RecentFiles';

export default function WelcomePage() {
  const { openFileDialog } = useDatabase();
  const { recentFiles } = useRecentFiles();

  const handleOpenRecent = async (path: string) => {
    const { useDatabaseStore } = await import('@/stores/databaseStore');
    await useDatabaseStore.getState().openDatabase(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary px-4">
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Database className="w-10 h-10 text-accent" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            SQLite Lens
          </h1>
          <p className="text-text-secondary text-base">
            Lightweight SQLite Database Viewer
          </p>
        </div>
        <button
          onClick={openFileDialog}
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors mt-2"
        >
          <FolderOpen className="w-5 h-5" />
          <span>Open Database</span>
        </button>
      </div>

      <RecentFiles files={recentFiles} onOpenFile={handleOpenRecent} />

      <p className="fixed bottom-6 text-text-muted text-xs">
        Or drag & drop a .db file here
      </p>
    </div>
  );
}
