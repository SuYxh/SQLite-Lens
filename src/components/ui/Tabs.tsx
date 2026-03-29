import React from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-0 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<TabProps>(child)) return null;
        const isActive = child.props.value === value;
        return (
          <button
            onClick={() => onChange(child.props.value)}
            className={clsx(
              'relative flex items-center gap-1.5 px-3 py-2 text-sm transition-colors',
              isActive
                ? 'text-[var(--color-accent)] bg-[var(--color-bg-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
            )}
          >
            {child.props.icon && (
              <span className="shrink-0">{child.props.icon}</span>
            )}
            <span>{child.props.label}</span>
            {child.props.closable && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  child.props.onClose?.();
                }}
                className="ml-1 rounded p-0.5 hover:bg-[var(--color-bg-tertiary)]"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Tab(_props: TabProps) {
  return null;
}
