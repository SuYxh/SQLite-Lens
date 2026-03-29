import { useState } from 'react';
import clsx from 'clsx';
import { Keyboard, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

interface ShortcutDef {
  id: string;
  label: string;
  category: string;
  defaultKey: string;
}

const DEFAULT_SHORTCUTS: ShortcutDef[] = [
  { id: 'execute-sql', label: '执行 SQL', category: '编辑器', defaultKey: '⌘+Enter' },
  { id: 'new-tab', label: '新建 SQL 标签', category: '编辑器', defaultKey: '⌘+T' },
  { id: 'close-tab', label: '关闭标签', category: '编辑器', defaultKey: '⌘+W' },
  { id: 'open-file', label: '打开数据库', category: '文件', defaultKey: '⌘+O' },
  { id: 'save', label: '保存', category: '文件', defaultKey: '⌘+S' },
  { id: 'toggle-sidebar', label: '切换侧边栏', category: '视图', defaultKey: '⌘+B' },
  { id: 'view-data', label: '数据视图', category: '视图', defaultKey: '⌘+1' },
  { id: 'view-structure', label: '结构视图', category: '视图', defaultKey: '⌘+2' },
  { id: 'view-sql', label: 'SQL 视图', category: '视图', defaultKey: '⌘+3' },
  { id: 'open-settings', label: '打开设置', category: '通用', defaultKey: '⌘+,' },
  { id: 'format-sql', label: '格式化 SQL', category: '编辑器', defaultKey: '⌘+Shift+F' },
  { id: 'find', label: '查找', category: '编辑器', defaultKey: '⌘+F' },
];

export function KeyboardShortcutsSettings() {
  const shortcuts = useSettingsStore((s) => s.keyboardShortcuts);
  const saveSettings = useSettingsStore((s) => s.saveSettings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKey, setRecordedKey] = useState('');
  const [conflict, setConflict] = useState<string | null>(null);

  const getShortcutKey = (id: string) => {
    return shortcuts[id] || DEFAULT_SHORTCUTS.find((s) => s.id === id)?.defaultKey || '';
  };

  const formatKeyEvent = (e: React.KeyboardEvent): string => {
    const parts: string[] = [];
    if (e.metaKey) parts.push('⌘');
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    const key = e.key;
    if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
    }
    return parts.join('+');
  };

  const checkConflict = (newKey: string, currentId: string): string | null => {
    for (const shortcut of DEFAULT_SHORTCUTS) {
      if (shortcut.id === currentId) continue;
      const existingKey = getShortcutKey(shortcut.id);
      if (existingKey === newKey) {
        return shortcut.label;
      }
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      setEditingId(null);
      setRecordedKey('');
      setConflict(null);
      return;
    }

    if (['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) return;

    const keyCombo = formatKeyEvent(e);
    setRecordedKey(keyCombo);

    const conflictLabel = checkConflict(keyCombo, id);
    setConflict(conflictLabel);
  };

  const handleSave = (id: string) => {
    if (!recordedKey || conflict) return;
    useSettingsStore.setState((state) => ({
      keyboardShortcuts: { ...state.keyboardShortcuts, [id]: recordedKey },
    }));
    saveSettings();
    setEditingId(null);
    setRecordedKey('');
    setConflict(null);
  };

  const handleResetOne = (id: string) => {
    useSettingsStore.setState((state) => {
      const newShortcuts = { ...state.keyboardShortcuts };
      delete newShortcuts[id];
      return { keyboardShortcuts: newShortcuts };
    });
    saveSettings();
  };

  const handleResetAll = () => {
    useSettingsStore.setState({ keyboardShortcuts: {} });
    saveSettings();
    setEditingId(null);
    setRecordedKey('');
    setConflict(null);
  };

  const categories = [...new Set(DEFAULT_SHORTCUTS.map((s) => s.category))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-[var(--color-text-secondary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">快捷键设置</h3>
        </div>
        <button
          onClick={handleResetAll}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          恢复默认
        </button>
      </div>

      {categories.map((category) => (
        <div key={category} className="flex flex-col gap-1">
          <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            {category}
          </h4>
          {DEFAULT_SHORTCUTS.filter((s) => s.category === category).map((shortcut) => {
            const isEditing = editingId === shortcut.id;
            const currentKey = getShortcutKey(shortcut.id);
            const isCustomized = shortcuts[shortcut.id] !== undefined;

            return (
              <div
                key={shortcut.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <span className="text-sm text-[var(--color-text-primary)]">{shortcut.label}</span>
                <div className="flex items-center gap-2">
                  {isCustomized && !isEditing && (
                    <button
                      onClick={() => handleResetOne(shortcut.id)}
                      className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                      title="恢复默认"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                  {isEditing ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          readOnly
                          value={recordedKey || '按下快捷键...'}
                          onKeyDown={(e) => handleKeyDown(e, shortcut.id)}
                          className={clsx(
                            'w-40 h-7 px-2 text-xs rounded border text-center outline-none bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]',
                            conflict
                              ? 'border-[var(--color-error)] ring-1 ring-[var(--color-error)]'
                              : 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                          )}
                        />
                        <button
                          onClick={() => handleSave(shortcut.id)}
                          disabled={!recordedKey || !!conflict}
                          className="px-2 py-1 text-xs rounded bg-[var(--color-accent)] text-white disabled:opacity-50 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setRecordedKey('');
                            setConflict(null);
                          }}
                          className="px-2 py-1 text-xs rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors"
                        >
                          取消
                        </button>
                      </div>
                      {conflict && (
                        <div className="flex items-center gap-1 text-[10px] text-[var(--color-error)]">
                          <AlertTriangle className="h-3 w-3" />
                          与「{conflict}」冲突
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingId(shortcut.id)}
                      className={clsx(
                        'px-2 py-0.5 text-xs rounded border font-mono transition-colors',
                        isCustomized
                          ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      {currentKey}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
        点击快捷键按钮进入编辑模式，按下新的快捷键组合后点击保存。按 Esc 取消。
      </p>
    </div>
  );
}
