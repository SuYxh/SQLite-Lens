import React, { useState, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

interface ContextMenuProviderProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
}

export function ContextMenuProvider({ items, children }: ContextMenuProviderProps) {
  const [menu, setMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    const handleScroll = () => {
      setMenu((prev) => ({ ...prev, visible: false }));
    };
    if (menu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [menu.visible]);

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}
      {menu.visible && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-lg"
          style={{ left: menu.x, top: menu.y }}
        >
          {items.map((item, i) =>
            item.separator ? (
              <div
                key={i}
                className="my-1 h-px bg-[var(--color-border)]"
              />
            ) : (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setMenu((prev) => ({ ...prev, visible: false }));
                }}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                  'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-4 text-xs text-[var(--color-text-muted)]">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
