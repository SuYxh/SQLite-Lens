import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';

interface CellEditorProps {
  value: unknown;
  columnType: string;
  onSave: (newValue: unknown) => void;
  onCancel: () => void;
}

function getInputType(columnType: string): 'text' | 'number' | 'disabled' {
  const lower = columnType.toLowerCase();
  if (lower.includes('blob')) return 'disabled';
  if (
    lower.includes('int') ||
    lower.includes('real') ||
    lower.includes('float') ||
    lower.includes('double') ||
    lower.includes('numeric')
  ) {
    return 'number';
  }
  return 'text';
}

export default function CellEditor({
  value,
  columnType,
  onSave,
  onCancel,
}: CellEditorProps) {
  const inputType = getInputType(columnType);
  const [editValue, setEditValue] = useState(value === null ? '' : String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputType === 'number') {
          const num = Number(editValue);
          onSave(editValue === '' ? null : isNaN(num) ? editValue : num);
        } else {
          onSave(editValue);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [editValue, inputType, onSave, onCancel]
  );

  const handleSetNull = () => {
    onSave(null);
  };

  if (inputType === 'disabled') {
    return (
      <div className="flex items-center gap-1 px-1">
        <span className="text-xs italic text-[var(--color-text-muted)]">[BLOB - not editable]</span>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type={inputType}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCancel}
        className={clsx(
          'h-7 w-full rounded border border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-2 text-sm text-[var(--color-text-primary)] outline-none',
          'focus:ring-1 focus:ring-[var(--color-accent)]'
        )}
      />
      <Button
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleSetNull}
        className="shrink-0 text-xs text-[var(--color-null)]"
      >
        NULL
      </Button>
    </div>
  );
}
