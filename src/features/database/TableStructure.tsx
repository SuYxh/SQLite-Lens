import { useMemo } from 'react';
import { Key, Copy } from 'lucide-react';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useTableStore } from '@/stores/tableStore';
import { formatNumber } from '@/utils/format';

export default function TableStructure() {
  const databases = useDatabaseStore((s) => s.databases);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const activeTable = useTableStore((s) => s.activeTable);

  const tableInfo = useMemo(() => {
    const db = databases.find((d) => d.id === activeDbId);
    if (!db?.schema || !activeTable) return null;
    return db.schema.tables.find((t) => t.name === activeTable) ?? null;
  }, [databases, activeDbId, activeTable]);

  const handleCopySql = () => {
    if (tableInfo?.create_sql) {
      navigator.clipboard.writeText(tableInfo.create_sql);
    }
  };

  if (!tableInfo) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Select a table to view its structure
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          {tableInfo.name}
        </h2>
        <span className="text-sm text-text-secondary">
          {formatNumber(tableInfo.row_count)} rows
        </span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-secondary border-b border-border">
              <th className="text-left px-4 py-2 font-medium text-text-secondary">Name</th>
              <th className="text-left px-4 py-2 font-medium text-text-secondary">Type</th>
              <th className="text-center px-4 py-2 font-medium text-text-secondary">PK</th>
              <th className="text-center px-4 py-2 font-medium text-text-secondary">Nullable</th>
              <th className="text-left px-4 py-2 font-medium text-text-secondary">Default</th>
            </tr>
          </thead>
          <tbody>
            {tableInfo.columns.map((col) => (
              <tr
                key={col.name}
                className="border-b border-border last:border-b-0 hover:bg-bg-secondary transition-colors"
              >
                <td className="px-4 py-2 text-text-primary font-medium">
                  {col.name}
                </td>
                <td className="px-4 py-2 text-text-secondary font-mono text-xs">
                  {col.data_type}
                </td>
                <td className="px-4 py-2 text-center">
                  {col.is_primary_key && (
                    <Key className="w-3.5 h-3.5 text-warning inline-block" />
                  )}
                </td>
                <td className="px-4 py-2 text-center text-text-muted text-xs">
                  {col.is_nullable ? 'YES' : 'NO'}
                </td>
                <td className="px-4 py-2 text-text-muted font-mono text-xs">
                  {col.default_value ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">
            CREATE SQL
          </h3>
          <button
            onClick={handleCopySql}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>
        <pre className="bg-bg-secondary border border-border rounded-lg p-4 text-sm text-text-primary font-mono overflow-x-auto whitespace-pre-wrap">
          {tableInfo.create_sql}
        </pre>
      </div>
    </div>
  );
}
