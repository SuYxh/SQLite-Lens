import React from 'react';
import clsx from 'clsx';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

export function GeneralSettings() {
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);
  const defaultPageSize = useSettingsStore((s) => s.defaultPageSize);
  const autoOpenLastFile = useSettingsStore((s) => s.autoOpenLastFile);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setDefaultPageSize = useSettingsStore((s) => s.setDefaultPageSize);
  const saveSettings = useSettingsStore((s) => s.saveSettings);

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '浅色', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: '深色', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: '跟随系统', icon: <Monitor className="h-4 w-4" /> },
  ];

  const pageSizeOptions = [50, 100, 200, 500];

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    saveSettings();
  };

  const handleLanguageChange = (value: 'zh' | 'en') => {
    setLanguage(value);
    saveSettings();
  };

  const handlePageSizeChange = (value: number) => {
    setDefaultPageSize(value);
    saveSettings();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">主题</h3>
        <div className="flex gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={clsx(
                'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
                theme === option.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">语言</h3>
        <div className="flex gap-2">
          {[
            { value: 'zh' as const, label: '中文' },
            { value: 'en' as const, label: 'English' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={clsx(
                'rounded-md border px-3 py-2 text-sm transition-colors',
                language === option.value
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">默认每页行数</h3>
        <div className="flex gap-2">
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => handlePageSizeChange(size)}
              className={clsx(
                'rounded-md border px-3 py-2 text-sm transition-colors',
                defaultPageSize === size
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">自动打开上次文件</h3>
          <p className="text-xs text-[var(--color-text-muted)]">启动时自动打开上次使用的数据库文件</p>
        </div>
        <button
          onClick={() => {
            useSettingsStore.setState({ autoOpenLastFile: !autoOpenLastFile });
            saveSettings();
          }}
          className={clsx(
            'relative h-5 w-9 rounded-full transition-colors',
            autoOpenLastFile ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              autoOpenLastFile ? 'left-[18px]' : 'left-0.5'
            )}
          />
        </button>
      </div>
    </div>
  );
}
