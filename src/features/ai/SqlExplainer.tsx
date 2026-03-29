import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAi } from '@/hooks/useAi';

interface SqlExplainerProps {
  sql: string;
}

export function SqlExplainer({ sql }: SqlExplainerProps) {
  const { explainSql } = useAi();
  const [explanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    await explainSql(sql);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        icon={loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
        onClick={handleExplain}
        loading={loading}
        disabled={!sql.trim()}
      >
        解释 SQL
      </Button>
      {explanation && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
