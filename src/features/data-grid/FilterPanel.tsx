import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useTableStore } from '@/stores/tableStore';
import type { FilterOperator, FilterCondition } from '@/types/query';

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'Equals', label: 'equals' },
  { value: 'NotEquals', label: 'not equals' },
  { value: 'Contains', label: 'contains' },
  { value: 'StartsWith', label: 'starts with' },
  { value: 'EndsWith', label: 'ends with' },
  { value: 'GreaterThan', label: 'greater than' },
  { value: 'LessThan', label: 'less than' },
  { value: 'IsNull', label: 'is null' },
  { value: 'IsNotNull', label: 'is not null' },
];

const NO_VALUE_OPS: FilterOperator[] = ['IsNull', 'IsNotNull'];

export default function FilterPanel() {
  const columns = useTableStore((s) => s.columns);
  const filters = useTableStore((s) => s.filters);
  const addFilter = useTableStore((s) => s.addFilter);
  const removeFilter = useTableStore((s) => s.removeFilter);

  const [column, setColumn] = useState(columns[0] ?? '');
  const [operator, setOperator] = useState<FilterOperator>('Equals');
  const [value, setValue] = useState('');

  const handleAdd = () => {
    if (!column) return;
    if (!NO_VALUE_OPS.includes(operator) && !value.trim()) return;
    const filter: FilterCondition = {
      column,
      operator,
      value: NO_VALUE_OPS.includes(operator) ? '' : value.trim(),
    };
    addFilter(filter);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="border-b border-border bg-bg-secondary px-3 py-2">
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {filters.map((f, i) => (
            <span
              key={`${f.column}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent rounded-md"
            >
              <span className="font-medium">{f.column}</span>
              <span className="text-accent/70">
                {OPERATORS.find((o) => o.value === f.operator)?.label}
              </span>
              {!NO_VALUE_OPS.includes(f.operator) && (
                <span className="font-medium">"{f.value}"</span>
              )}
              <button
                onClick={() => removeFilter(f.column)}
                className="ml-0.5 hover:text-error transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <select
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          className="text-xs bg-bg-primary border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-accent"
        >
          {columns.map((colName) => (
            <option key={colName} value={colName}>
              {colName}
            </option>
          ))}
        </select>

        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as FilterOperator)}
          className="text-xs bg-bg-primary border border-border rounded px-2 py-1.5 text-text-primary focus:outline-none focus:border-accent"
        >
          {OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {!NO_VALUE_OPS.includes(operator) && (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Value..."
            className="text-xs bg-bg-primary border border-border rounded px-2 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent flex-1 min-w-[120px]"
          />
        )}

        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-accent hover:bg-accent-hover text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>
    </div>
  );
}
