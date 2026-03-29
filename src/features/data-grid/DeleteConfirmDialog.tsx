import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  count: number;
  onConfirm: () => void;
  tableName?: string;
  pkColumn?: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  count,
  onConfirm,
  tableName,
  pkColumn,
}: DeleteConfirmDialogProps) {
  const previewSql = tableName && pkColumn
    ? `DELETE FROM ${tableName} WHERE ${pkColumn} IN (... ${count} value${count > 1 ? 's' : ''} ...);`
    : `DELETE ... (${count} row${count > 1 ? 's' : ''})`;

  return (
    <Dialog open={open} onClose={onClose} title="Confirm Delete">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--color-error)]/10 p-2">
            <AlertTriangle className="h-5 w-5 text-[var(--color-error)]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Are you sure you want to delete {count} row{count > 1 ? 's' : ''}?
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              This action cannot be undone.
            </span>
          </div>
        </div>
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2">
          <pre className="text-xs text-[var(--color-text-secondary)]">
            {previewSql}
          </pre>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
