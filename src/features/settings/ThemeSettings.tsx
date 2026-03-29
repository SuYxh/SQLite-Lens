import React from 'react';
import clsx from 'clsx';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeSettings() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const saveSettings = useSettingsStore((s) => s.saveSettings);

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '浅色', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: '深色', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: '跟随系统', icon: <Monitor className="h-4 w-4" /> },
  ];

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    saveSettings();
  };

  const lightColors = [
    { name: '主背景', value: '#ffffff' },
    { name: '次背景', value: '#f8f9fa' },
    { name: '主文字', value: '#1f2937' },
    { name: '强调色', value: '#2563eb' },
    { name: '边框', value: '#e5e7eb' },
    { name: '成功', value: '#16a34a' },
    { name: '警告', value: '#d97706' },
    { name: '错误', value: '#dc2626' },
  ];

  const darkColors = [
    { name: '主背景', value: '#1a1b1e' },
    { name: '次背景', value: '#25262b' },
    { name: '主文字', value: '#e5e7eb' },
    { name: '强调色', value: '#3b82f6' },
    { name: '边框', value: '#374151' },
    { name: '成功', value: '#22c55e' },
    { name: '警告', value: '#f59e0b' },
    { name: '错误', value: '#ef4444' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">主题选择</h3>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">浅色主题</h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
            <div className="grid grid-cols-4 gap-2">
              {lightColors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded-md border border-[#e5e7eb]"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)]">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">深色主题</h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-[#1a1b1e] p-3">
            <div className="grid grid-cols-4 gap-2">
              {darkColors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1">
                  <div
                    className="h-8 w-8 rounded-md border border-[#374151]"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-[10px] text-[#6b7280]">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">当前配色</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: '主背景', var: '--color-bg-primary' },
            { name: '次背景', var: '--color-bg-secondary' },
            { name: '三级背景', var: '--color-bg-tertiary' },
            { name: '强调色', var: '--color-accent' },
            { name: '主文字', var: '--color-text-primary' },
            { name: '次文字', var: '--color-text-secondary' },
            { name: '弱文字', var: '--color-text-muted' },
            { name: '边框', var: '--color-border' },
          ].map((item) => (
            <div key={item.var} className="flex items-center gap-2">
              <div
                className="h-6 w-6 shrink-0 rounded border border-[var(--color-border)]"
                style={{ backgroundColor: `var(${item.var})` }}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
