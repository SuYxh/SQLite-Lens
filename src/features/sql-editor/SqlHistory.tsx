import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Search, Trash2, Copy, Clock, X } from 'lucide-react';
import { useSqlHistoryStore, type SqlHistoryEntry } from '@/stores/sqlHistoryStore';
import { useSqlEditorStore } from '@/stores/sqlEditorStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SqlHistoryProps {
  onClose?: () => void;
}

export function SqlHistory({ onClose }: SqlHistoryProps) {
  const history = useSqlHistoryStore((s) => s.history);
  const clearHistory = useSqlHistoryStore((s) => s.clearHistory);
  const searchHistory = useSqlHistoryStore((s) => s.searchHistory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    return searchHistory(searchQuery);
  }, [history, searchQuery, searchHistory]);

  const handleCopy = async (sql: string) => {
    await navigator.clipboard.writeText(sql);
  };

  const handleInsert = (sql: string) => {
    const activeTabId = useSqlEditorStore.getState().activeTabId;
    if (activeTabId) {
      useSqlEditorStore.getState().updateContent(activeTabId, sql);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <span className="text-xs font-medium text-text-secondary flex-1">History</span>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          icon={<Search className="h-3.5 w-3.5" />}
          className="h-7 text-xs flex-1"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={clearHistory}
          disabled={history.length === 0}
        />
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="h-3.5 w-3.5" />}
            onClick={onClose}
          />
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-[var(--color-text-muted)]">
            {searchQuery ? 'No matching history' : 'No SQL history yet'}
          </div>
        )}
        {filteredHistory.map((entry: SqlHistoryEntry) => (
          <div
            key={entry.id}
            className="group cursor-pointer border-b border-[var(--color-border)] px-3 py-2 hover:bg-[var(--color-bg-secondary)] transition-colors"
            onClick={() => handleCopy(entry.sql)}
            onDoubleClick={() => handleInsert(entry.sql)}
          >
            <pre className="mb-1 truncate text-xs text-[var(--color-text-primary)]">
              {entry.sql}
            </pre>
            <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {formatTime(entry.executedAt)}
              </span>
              <span>{entry.executionTimeMs.toFixed(0)}ms</span>
              <span
                className={clsx(
                  entry.isSelect
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-warning)]'
                )}
              >
                {entry.isSelect
                  ? `${entry.rowsAffected} rows`
                  : `${entry.rowsAffected} affected`}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(entry.sql);
                }}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
