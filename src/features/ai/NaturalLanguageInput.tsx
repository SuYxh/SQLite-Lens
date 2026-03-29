import React, { useState } from 'react';
import clsx from 'clsx';
import { Sparkles, ChevronUp, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';

export function NaturalLanguageInput() {
  const { isConfigured, isGenerating, generateSql } = useAi();
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() || isGenerating) return;
    await generateSql(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isConfigured) return null;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent)] transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          自然语言生成 SQL
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="rounded-md p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你想查询的内容..."
          disabled={isGenerating}
          className="flex-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isGenerating}
          className={clsx(
            'flex items-center justify-center rounded-md px-3 h-8 text-sm font-medium transition-colors',
            'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
