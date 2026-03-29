import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useTableStore } from '@/stores/tableStore';
import { useUiStore } from '@/stores/uiStore';
import TableListItem from './TableListItem';

export default function TableList() {
  const databases = useDatabaseStore((s) => s.databases);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const activeTable = useTableStore((s) => s.activeTable);
  const selectTable = useTableStore((s) => s.selectTable);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const [search, setSearch] = useState('');
  const [indexesOpen, setIndexesOpen] = useState(false);

  const db = databases.find((d) => d.id === activeDbId);

  const filtered = useMemo(() => {
    if (!db?.schema) return { tables: [], views: [], indexes: [] };
    const q = search.toLowerCase();
    return {
      tables: db.schema.tables.filter((t) => t.name.toLowerCase().includes(q)),
      views: db.schema.views.filter((v) => v.name.toLowerCase().includes(q)),
      indexes: db.schema.indexes.filter((i) => i.name.toLowerCase().includes(q)),
    };
  }, [db, search]);

  const handleSelect = (name: string) => {
    selectTable(name);
    setActiveView('data');
  };

  const handleContextMenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(name);
  };

  if (!db) {
    return (
      <div className="p-4 text-text-muted text-sm">
        No database selected
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-bg-tertiary border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="mb-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Tables
            </span>
            <span className="text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              {filtered.tables.length}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {filtered.tables.map((table) => (
              <TableListItem
                key={table.name}
                name={table.name}
                rowCount={table.row_count}
                isActive={activeTable === table.name}
                type="table"
                onClick={() => handleSelect(table.name)}
                onContextMenu={(e) => handleContextMenu(table.name, e)}
              />
            ))}
          </div>
        </div>

        {filtered.views.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Views
              </span>
              <span className="text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {filtered.views.length}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {filtered.views.map((view) => (
                <TableListItem
                  key={view.name}
                  name={view.name}
                  isActive={activeTable === view.name}
                  type="view"
                  onClick={() => handleSelect(view.name)}
                  onContextMenu={(e) => handleContextMenu(view.name, e)}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.indexes.length > 0 && (
          <div>
            <button
              onClick={() => setIndexesOpen(!indexesOpen)}
              className="flex items-center justify-between w-full px-1 mb-1"
            >
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                {indexesOpen ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                Indexes
              </span>
              <span className="text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {filtered.indexes.length}
              </span>
            </button>
            {indexesOpen && (
              <div className="flex flex-col gap-0.5">
                {filtered.indexes.map((index) => (
                  <TableListItem
                    key={index.name}
                    name={index.name}
                    isActive={false}
                    type="index"
                    onClick={() => {}}
                    onContextMenu={(e) => handleContextMenu(index.name, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
