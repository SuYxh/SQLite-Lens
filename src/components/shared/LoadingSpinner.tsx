import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message, className }: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
      {message && (
        <span className="text-sm text-[var(--color-text-secondary)]">{message}</span>
      )}
    </div>
  );
}
