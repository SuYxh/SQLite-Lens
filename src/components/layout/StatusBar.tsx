import clsx from 'clsx';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useTableStore } from '@/stores/tableStore';

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const databases = useDatabaseStore((s) => s.databases);
  const activeDb = databases.find((db) => db.id === activeDbId);
  const activeTable = useTableStore((s) => s.activeTable);
  const totalRows = useTableStore((s) => s.totalRows);

  return (
    <div
      className={clsx(
        'flex h-6 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span
            className={clsx(
              'h-2 w-2 rounded-full',
              activeDb
                ? 'bg-[var(--color-success)]'
                : 'bg-[var(--color-text-muted)]'
            )}
          />
          <span className="text-[var(--color-text-secondary)]">
            {activeDb ? 'Connected' : 'No database open'}
          </span>
        </div>
        {activeTable && (
          <span className="text-[var(--color-text-muted)]">{activeTable}</span>
        )}
      </div>
      {activeTable && (
        <span className="text-[var(--color-text-muted)]">
          {totalRows.toLocaleString()} rows
        </span>
      )}
    </div>
  );
}
