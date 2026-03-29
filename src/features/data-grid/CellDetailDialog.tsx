import { useMemo } from 'react';
import clsx from 'clsx';
import { Copy } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface CellDetailDialogProps {
  open: boolean;
  onClose: () => void;
  value: unknown;
  columnName: string;
  columnType: string;
}

function formatHex(value: unknown): string {
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
  }
  return String(value);
}

function tryFormatJson(value: string): string {
  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

export default function CellDetailDialog({
  open,
  onClose,
  value,
  columnName,
  columnType,
}: CellDetailDialogProps) {
  const isNull = value === null || value === undefined;
  const isBlob =
    value instanceof ArrayBuffer ||
    value instanceof Uint8Array ||
    columnType.toLowerCase().includes('blob');

  const displayValue = useMemo(() => {
    if (isNull) return null;
    if (isBlob) return formatHex(value);
    const strVal = String(value);
    if (typeof value === 'string') return tryFormatJson(strVal);
    return strVal;
  }, [value, isNull, isBlob]);

  const handleCopy = async () => {
    const text = isNull ? 'NULL' : String(value);
    await navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onClose={onClose} title={columnName} className="max-w-lg">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{columnType || 'UNKNOWN'}</span>
          {isNull && (
            <span className="rounded bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 italic text-[var(--color-null)]">
              NULL
            </span>
          )}
        </div>
        {!isNull && (
          <pre
            className={clsx(
              'max-h-80 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-sm text-[var(--color-text-primary)]',
              isBlob && 'font-mono text-xs'
            )}
          >
            {displayValue}
          </pre>
        )}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon={<Copy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            Copy
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
