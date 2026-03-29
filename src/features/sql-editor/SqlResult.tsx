import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSqlEditorStore } from '@/stores/sqlEditorStore';
import { useAiStore } from '@/stores/aiStore';
import { formatDuration } from '@/utils/format';
import { ErrorFixer } from '@/features/ai/ErrorFixer';

export default function SqlResult() {
  const tabs = useSqlEditorStore((s) => s.tabs);
  const activeTabId = useSqlEditorStore((s) => s.activeTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No active query
      </div>
    );
  }

  if (activeTab.isExecuting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activeTab.error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <p className="text-error text-sm whitespace-pre-wrap">
              {activeTab.error}
            </p>
          </div>
          {useAiStore.getState().isConfigured && (
            <ErrorFixer
              sql={activeTab.content}
              error={activeTab.error}
              onApplyFix={(sql) => {
                useSqlEditorStore.getState().updateContent(activeTabId, sql);
              }}
            />
          )}
        </div>
        {activeTab.executionTime !== null && (
          <div className="px-4 py-2 border-t border-border text-xs text-text-muted">
            {formatDuration(activeTab.executionTime)}
          </div>
        )}
      </div>
    );
  }

  if (!activeTab.result) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Press ⌘+Enter to execute query
      </div>
    );
  }

  const { result } = activeTab;

  if (!result.is_select) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="text-text-primary text-sm">
            {result.affected_rows} rows affected
          </span>
        </div>
        {activeTab.executionTime !== null && (
          <div className="px-4 py-2 border-t border-border text-xs text-text-muted">
            {formatDuration(activeTab.executionTime)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              {result.columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-xs font-semibold text-text-secondary bg-bg-secondary border-b border-r border-border whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.slice(0, 1000).map((row, i) => (
              <tr
                key={i}
                className="border-b border-border hover:bg-bg-secondary transition-colors"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="px-3 py-1.5 border-r border-border whitespace-nowrap text-text-primary"
                  >
                    {cell === null ? (
                      <span className="italic text-null">NULL</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {result.rows.length === 0 && (
          <div className="flex items-center justify-center py-8 text-text-muted text-sm">
            No results
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-text-muted">
        <span>
          {result.rows.length} rows
          {result.rows.length > 1000 && ' (showing first 1000)'}
        </span>
        {activeTab.executionTime !== null && (
          <span>{formatDuration(activeTab.executionTime)}</span>
        )}
      </div>
    </div>
  );
}
