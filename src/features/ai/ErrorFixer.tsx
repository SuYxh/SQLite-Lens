import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAi } from '@/hooks/useAi';

interface ErrorFixerProps {
  sql: string;
  error: string;
  onApplyFix?: (sql: string) => void;
}

export function ErrorFixer({ sql, error, onApplyFix }: ErrorFixerProps) {
  const { fixError, lastSuggestion } = useAi();
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    await fixError(sql, error);
    setLoading(false);
  };

  const hasFix = lastSuggestion?.type === 'fix' && lastSuggestion.sql;

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        icon={loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
        onClick={handleFix}
        loading={loading}
        disabled={!sql.trim() || !error.trim()}
      >
        AI 修复
      </Button>
      {hasFix && (
        <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
          {lastSuggestion!.content && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {lastSuggestion!.content}
            </p>
          )}
          <pre className="overflow-x-auto rounded-md bg-[var(--color-bg-tertiary)] p-3 text-sm text-[var(--color-text-primary)]">
            <code>{lastSuggestion!.sql}</code>
          </pre>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApplyFix?.(lastSuggestion!.sql!)}
          >
            应用修复
          </Button>
        </div>
      )}
    </div>
  );
}
