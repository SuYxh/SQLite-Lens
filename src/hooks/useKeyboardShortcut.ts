import { useEffect } from 'react';

interface Modifiers {
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: Modifiers
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modifiers?.meta && !e.metaKey) return;
      if (modifiers?.shift && !e.shiftKey) return;
      if (modifiers?.alt && !e.altKey) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [key, callback, modifiers?.meta, modifiers?.shift, modifiers?.alt]);
}
