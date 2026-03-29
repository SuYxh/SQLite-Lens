import React, { useState } from 'react';
import clsx from 'clsx';
import { Settings, Cpu, Palette, X, Code2, Keyboard } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { GeneralSettings } from './GeneralSettings';
import { AiProviderSettings } from './AiProviderSettings';
import { ThemeSettings } from './ThemeSettings';
import { EditorSettings } from './EditorSettings';
import { KeyboardShortcutsSettings } from './KeyboardShortcutsSettings';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'ai' | 'theme' | 'editor' | 'shortcuts';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: '通用', icon: <Settings className="h-4 w-4" /> },
  { id: 'editor', label: '编辑器', icon: <Code2 className="h-4 w-4" /> },
  { id: 'shortcuts', label: '快捷键', icon: <Keyboard className="h-4 w-4" /> },
  { id: 'ai', label: 'AI 配置', icon: <Cpu className="h-4 w-4" /> },
  { id: 'theme', label: '主题', icon: <Palette className="h-4 w-4" /> },
];

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'editor':
        return <EditorSettings />;
      case 'shortcuts':
        return <KeyboardShortcutsSettings />;
      case 'ai':
        return <AiProviderSettings />;
      case 'theme':
        return <ThemeSettings />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="!max-w-2xl">
      <div className="flex h-[480px]">
        <div className="flex w-40 shrink-0 flex-col border-r border-[var(--color-border)] p-2">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">设置</h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </div>
      </div>
    </Dialog>
  );
}
