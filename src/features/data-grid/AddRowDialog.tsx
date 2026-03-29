import { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ColumnInfo } from '@/types/database';

interface AddRowDialogProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnInfo[];
  onInsert: (values: Record<string, unknown>) => void;
}

export default function AddRowDialog({
  open,
  onClose,
  columns,
  onInsert,
}: AddRowDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [nullFields, setNullFields] = useState<Set<string>>(new Set());

  const handleChange = (colName: string, val: string) => {
    setValues((prev) => ({ ...prev, [colName]: val }));
    setNullFields((prev) => {
      const next = new Set(prev);
      next.delete(colName);
      return next;
    });
  };

  const toggleNull = (colName: string) => {
    setNullFields((prev) => {
      const next = new Set(prev);
      if (next.has(colName)) {
        next.delete(colName);
      } else {
        next.add(colName);
      }
      return next;
    });
  };

  const handleInsert = () => {
    const result: Record<string, unknown> = {};
    for (const col of columns) {
      if (nullFields.has(col.name)) {
        result[col.name] = null;
      } else if (col.is_primary_key && !values[col.name]) {
        continue;
      } else {
        result[col.name] = values[col.name] ?? '';
      }
    }
    onInsert(result);
    setValues({});
    setNullFields(new Set());
    onClose();
  };

  const previewSql = useMemo(() => {
    const cols: string[] = [];
    const vals: string[] = [];
    for (const col of columns) {
      if (col.is_primary_key && !values[col.name] && !nullFields.has(col.name)) {
        continue;
      }
      cols.push(col.name);
      if (nullFields.has(col.name)) {
        vals.push('NULL');
      } else {
        vals.push(`'${(values[col.name] ?? '').replace(/'/g, "''")}'`);
      }
    }
    const tableName = 'table_name';
    return `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${vals.join(', ')});`;
  }, [columns, values, nullFields]);

  return (
    <Dialog open={open} onClose={onClose} title="Add Row" className="max-w-lg">
      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
        {columns.map((col) => (
          <div key={col.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {col.name}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {col.data_type}
                </span>
              </div>
              {col.is_nullable && (
                <label className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nullFields.has(col.name)}
                    onChange={() => toggleNull(col.name)}
                    className="rounded"
                  />
                  NULL
                </label>
              )}
            </div>
            {col.is_primary_key && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Primary key (auto-increment) — leave empty to auto-generate
              </span>
            )}
            <Input
              value={nullFields.has(col.name) ? '' : values[col.name] ?? ''}
              onChange={(e) => handleChange(col.name, e.target.value)}
              disabled={nullFields.has(col.name)}
              placeholder={nullFields.has(col.name) ? 'NULL' : ''}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2">
        <pre className="text-xs text-[var(--color-text-secondary)] overflow-x-auto">
          {previewSql}
        </pre>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleInsert}>
          Insert
        </Button>
      </div>
    </Dialog>
  );
}
