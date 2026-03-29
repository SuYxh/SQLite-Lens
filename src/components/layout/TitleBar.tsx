import { Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useDatabaseStore } from '@/stores/databaseStore';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

export function TitleBar() {
  const { isDark, setTheme } = useTheme();
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const databases = useDatabaseStore((s) => s.databases);
  const activeDb = databases.find((db) => db.id === activeDbId);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div
      data-tauri-drag-region
      className="flex h-10 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] pl-[80px] pr-3"
    >
      <div data-tauri-drag-region className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          SQLite Lens
        </span>
        {activeDb && (
          <span className="text-xs text-[var(--color-text-muted)]">
            — {activeDb.file_name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip content={isDark ? 'Light mode' : 'Dark mode'}>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>
        <Tooltip content="Settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
