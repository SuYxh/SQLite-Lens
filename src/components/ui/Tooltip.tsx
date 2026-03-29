import React from 'react';
import clsx from 'clsx';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionStyles: Record<NonNullable<TooltipProps['position']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <span
        className={clsx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs',
          'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]',
          'opacity-0 transition-opacity group-hover:opacity-100',
          positionStyles[position]
        )}
      >
        {content}
      </span>
    </div>
  );
}
