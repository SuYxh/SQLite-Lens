import React from 'react';
import clsx from 'clsx';
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';

interface SidebarProps {
  children: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export function Sidebar({ children, searchValue, onSearchChange, className }: SidebarProps) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <div
      className={clsx(
        'flex h-full flex-col bg-[var(--color-bg-secondary)]',
        className
      )}
    >
      <div className="flex-none p-2">
        <Input
          placeholder="Search tables..."
          icon={<Search className="h-4 w-4" />}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-2">{children}</div>
      <div className="flex-none border-t border-[var(--color-border)] p-2">
        <Tooltip content={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} position="right">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="w-full">
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
