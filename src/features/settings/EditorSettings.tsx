import clsx from 'clsx';
import { useSettingsStore } from '@/stores/settingsStore';

const fontFamilyOptions = [
  { value: 'JetBrains Mono, Fira Code, monospace', label: 'JetBrains Mono' },
  { value: 'Fira Code, monospace', label: 'Fira Code' },
  { value: 'SF Mono, Menlo, monospace', label: 'SF Mono' },
  { value: 'Menlo, Monaco, monospace', label: 'Menlo' },
  { value: 'Monaco, monospace', label: 'Monaco' },
];

const fontSizeOptions = [12, 13, 14, 15, 16, 18];
const tabSizeOptions = [2, 4];

export function EditorSettings() {
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
  const editorFontFamily = useSettingsStore((s) => s.editorFontFamily);
  const editorTabSize = useSettingsStore((s) => s.editorTabSize);
  const editorWordWrap = useSettingsStore((s) => s.editorWordWrap);
  const editorMinimap = useSettingsStore((s) => s.editorMinimap);
  const setEditorFontSize = useSettingsStore((s) => s.setEditorFontSize);
  const saveSettings = useSettingsStore((s) => s.saveSettings);

  const handleFontFamilyChange = (value: string) => {
    useSettingsStore.setState({ editorFontFamily: value });
    saveSettings();
  };

  const handleFontSizeChange = (size: number) => {
    setEditorFontSize(size);
    saveSettings();
  };

  const handleTabSizeChange = (size: number) => {
    useSettingsStore.setState({ editorTabSize: size });
    saveSettings();
  };

  const handleWordWrapToggle = () => {
    useSettingsStore.setState({ editorWordWrap: !editorWordWrap });
    saveSettings();
  };

  const handleMinimapToggle = () => {
    useSettingsStore.setState({ editorMinimap: !editorMinimap });
    saveSettings();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">字体</h3>
        <div className="flex flex-wrap gap-2">
          {fontFamilyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFontFamilyChange(option.value)}
              className={clsx(
                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                editorFontFamily === option.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
              style={{ fontFamily: option.value }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">字号</h3>
        <div className="flex gap-2">
          {fontSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={clsx(
                'rounded-md border px-3 py-1.5 text-sm transition-colors min-w-[40px]',
                editorFontSize === size
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Tab 大小</h3>
        <div className="flex gap-2">
          {tabSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => handleTabSizeChange(size)}
              className={clsx(
                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                editorTabSize === size
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              {size} 空格
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">自动换行</h3>
          <p className="text-xs text-[var(--color-text-muted)]">编辑器中超长行自动换行</p>
        </div>
        <button
          onClick={handleWordWrapToggle}
          className={clsx(
            'relative h-5 w-9 rounded-full transition-colors',
            editorWordWrap ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              editorWordWrap ? 'left-[18px]' : 'left-0.5'
            )}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">迷你地图</h3>
          <p className="text-xs text-[var(--color-text-muted)]">在编辑器右侧显示代码缩略图</p>
        </div>
        <button
          onClick={handleMinimapToggle}
          className={clsx(
            'relative h-5 w-9 rounded-full transition-colors',
            editorMinimap ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              editorMinimap ? 'left-[18px]' : 'left-0.5'
            )}
          />
        </button>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] p-3">
        <p className="text-xs text-[var(--color-text-muted)] mb-2">预览</p>
        <div
          className="rounded-md bg-[var(--color-bg-primary)] p-3 border border-[var(--color-border)]"
          style={{ fontFamily: editorFontFamily, fontSize: `${editorFontSize}px` }}
        >
          <pre className="text-[var(--color-text-primary)]">
{`SELECT u.name, COUNT(o.id)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
ORDER BY COUNT(o.id) DESC;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
