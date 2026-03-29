import clsx from 'clsx';
import { Upload } from 'lucide-react';

interface DropOverlayProps {
  visible: boolean;
}

export function DropOverlay({ visible }: DropOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-[var(--color-accent)]/20 backdrop-blur-sm'
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-bg-primary)]/80 px-16 py-12 animate-pulse">
        <Upload className="h-12 w-12 text-[var(--color-accent)]" />
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">
          Drop database file here
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          .db, .sqlite, .sqlite3, .s3db
        </span>
      </div>
    </div>
  );
}
