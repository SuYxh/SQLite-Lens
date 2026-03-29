import { ArrowUp, ArrowDown } from 'lucide-react';
import type { HeaderGroup } from '@tanstack/react-table';
import type { Value } from '@/types/query';
import { useTableStore } from '@/stores/tableStore';

interface DataGridHeaderProps {
  headerGroups: HeaderGroup<Value[]>[];
}

export default function DataGridHeader({ headerGroups }: DataGridHeaderProps) {
  const sortColumns = useTableStore((s) => s.sortColumns);
  const toggleSort = useTableStore((s) => s.toggleSort);

  return (
    <thead className="sticky top-0 z-10">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const colId = header.column.id;
            const sort = sortColumns.find((s) => s.column === colId);
            return (
              <th
                key={header.id}
                onClick={() => toggleSort(colId)}
                className="px-3 py-2 text-left text-xs font-semibold text-text-secondary bg-bg-secondary border-b border-r border-border cursor-pointer select-none hover:bg-bg-tertiary transition-colors whitespace-nowrap"
                style={{ minWidth: 100 }}
              >
                <div className="flex items-center gap-1">
                  <span>
                    {header.isPlaceholder
                      ? null
                      : typeof header.column.columnDef.header === 'string'
                        ? header.column.columnDef.header
                        : colId}
                  </span>
                  {sort?.direction === 'Asc' && (
                    <ArrowUp className="w-3 h-3 text-accent" />
                  )}
                  {sort?.direction === 'Desc' && (
                    <ArrowDown className="w-3 h-3 text-accent" />
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
