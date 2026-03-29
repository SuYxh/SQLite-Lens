import { Play, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AiSuggestion as AiSuggestionType } from '@/types/ai';

interface AiSuggestionProps {
  suggestion: AiSuggestionType;
  onUse: (sql: string) => void;
  onExecute: (sql: string) => void;
  onDismiss: () => void;
}

export function AiSuggestion({ suggestion, onUse, onExecute, onDismiss }: AiSuggestionProps) {
  const typeLabels: Record<AiSuggestionType['type'], string> = {
    generate: '生成的 SQL',
    explain: 'SQL 解释',
    fix: '修复建议',
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-accent)]">
          {typeLabels[suggestion.type]}
        </span>
        <button
          onClick={onDismiss}
          className="rounded-md p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {suggestion.content && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
          {suggestion.content}
        </p>
      )}

      {suggestion.sql && (
        <div className="flex flex-col gap-2">
          <pre className="overflow-x-auto rounded-md bg-[var(--color-bg-tertiary)] p-3 text-sm text-[var(--color-text-primary)]">
            <code>{suggestion.sql}</code>
          </pre>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => onUse(suggestion.sql!)}>
              使用
            </Button>
            <Button size="sm" variant="secondary" icon={<Play className="h-3.5 w-3.5" />} onClick={() => onExecute(suggestion.sql!)}>
              执行
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
