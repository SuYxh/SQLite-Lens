import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import clsx from 'clsx';

interface SplitPaneProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  className?: string;
}

export function SplitPane({ top, bottom, className }: SplitPaneProps) {
  return (
    <PanelGroup direction="vertical" className={clsx('flex-1', className)}>
      <Panel defaultSize={60} minSize={20}>
        {top}
      </Panel>
      <PanelResizeHandle className="h-px bg-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors" />
      <Panel defaultSize={40} minSize={15}>
        {bottom}
      </Panel>
    </PanelGroup>
  );
}
