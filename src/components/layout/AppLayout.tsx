import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { useUiStore } from '@/stores/uiStore';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen flex-col bg-[var(--color-bg-primary)]">
      <PanelGroup direction="horizontal" className="flex-1">
        {sidebarOpen && (
          <>
            <Panel
              defaultSize={20}
              minSize={15}
              maxSize={40}
              className="bg-[var(--color-bg-secondary)]"
            >
              {sidebar}
            </Panel>
            <PanelResizeHandle className="w-px bg-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors" />
          </>
        )}
        <Panel minSize={40} className="flex flex-col">
          {children}
        </Panel>
      </PanelGroup>
    </div>
  );
}
