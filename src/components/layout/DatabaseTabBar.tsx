import { useState } from 'react';
import clsx from 'clsx';
import { Database, X, Plus } from 'lucide-react';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useDatabase } from '@/hooks/useDatabase';
import { useEditStore } from '@/stores/editStore';
import { Tooltip } from '@/components/ui/Tooltip';

const MAX_DATABASES = 10;

export function DatabaseTabBar() {
  const databases = useDatabaseStore((s) => s.databases);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const setActiveDatabase = useDatabaseStore((s) => s.setActiveDatabase);
  const closeDatabase = useDatabaseStore((s) => s.closeDatabase);
  const { openFileDialog } = useDatabase();
  const hasUnsavedEdits = useEditStore((s) => s.hasUnsavedEdits);
  const [closingId, setClosingId] = useState<string | null>(null);

  if (databases.length === 0) return null;

  const handleClose = (id: string) => {
    if (hasUnsavedEdits()) {
      setClosingId(id);
      const confirmed = window.confirm(
        'You have unsaved edits. Are you sure you want to close this database?'
      );
      if (!confirmed) {
        setClosingId(null);
        return;
      }
    }
    setClosingId(null);
    closeDatabase(id);
  };

  return (
    <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex flex-1 items-center overflow-x-auto">
        {databases.map((db) => (
          <div
            key={db.id}
            onClick={() => setActiveDatabase(db.id)}
            className={clsx(
              'group flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm transition-colors',
              db.id === activeDbId
                ? 'border-[var(--color-accent)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[120px] truncate">{db.file_name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose(db.id);
              }}
              className={clsx(
                'ml-1 rounded p-0.5 transition-colors',
                'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
                closingId === db.id && 'opacity-50'
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <Tooltip content={databases.length >= MAX_DATABASES ? 'Maximum 10 databases' : 'Open database'}>
        <button
          onClick={openFileDialog}
          disabled={databases.length >= MAX_DATABASES}
          className={clsx(
            'mx-1 shrink-0 rounded-md p-1.5 transition-colors',
            'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
            'disabled:opacity-40 disabled:pointer-events-none'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
