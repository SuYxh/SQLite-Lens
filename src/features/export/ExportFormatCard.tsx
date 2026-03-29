import type { ReactNode } from 'react';
import clsx from 'clsx';

interface ExportFormatCardProps {
  format: string;
  label: string;
  icon: ReactNode;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export default function ExportFormatCard({
  label,
  icon,
  description,
  selected,
  onClick,
}: ExportFormatCardProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
      )}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-[var(--color-text-muted)]">{description}</span>
    </button>
  );
}
