import { useState } from 'react';
import clsx from 'clsx';
import { Plus, X, History } from 'lucide-react';
import { useSqlEditorStore } from '@/stores/sqlEditorStore';

interface SqlEditorTabsProps {
  onToggleHistory?: () => void;
}

export function SqlEditorTabs({ onToggleHistory }: SqlEditorTabsProps) {
  const tabs = useSqlEditorStore((s) => s.tabs);
  const activeTabId = useSqlEditorStore((s) => s.activeTabId);
  const setActiveTab = useSqlEditorStore((s) => s.setActiveTab);
  const createTab = useSqlEditorStore((s) => s.createTab);
  const closeTab = useSqlEditorStore((s) => s.closeTab);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleDoubleClick = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditTitle(currentTitle);
  };

  const handleRenameConfirm = (tabId: string) => {
    if (editTitle.trim()) {
      useSqlEditorStore.setState((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, title: editTitle.trim() } : t
        ),
      }));
    }
    setEditingTabId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleRenameConfirm(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  return (
    <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex flex-1 items-center overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => handleDoubleClick(tab.id, tab.title)}
            className={clsx(
              'group flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm transition-colors',
              tab.id === activeTabId
                ? 'border-[var(--color-accent)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {editingTabId === tab.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleRenameConfirm(tab.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, tab.id)}
                className="h-5 w-24 rounded border border-[var(--color-accent)] bg-[var(--color-bg-primary)] px-1 text-xs text-[var(--color-text-primary)] outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="max-w-[100px] truncate">{tab.title}</span>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-0.5 rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={createTab}
        className="mx-1 shrink-0 rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
      {onToggleHistory && (
        <button
          onClick={onToggleHistory}
          className="mx-1 shrink-0 rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <History className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
