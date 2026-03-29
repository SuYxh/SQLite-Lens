import { useState } from 'react';
import { Zap, Loader2, Copy, Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import * as aiService from '@/services/ai';

interface SqlOptimizePanelProps {
  sql: string;
  onUseSql?: (sql: string) => void;
  onClose?: () => void;
}

export function SqlOptimizePanel({ sql, onUseSql, onClose }: SqlOptimizePanelProps) {
  const isGenerating = useAiStore((s) => s.isGenerating);
  const optimizationResult = useAiStore((s) => s.optimizationResult);
  const clearOptimization = useAiStore((s) => s.clearOptimization);
  const optimizeSql = useAiStore((s) => s.optimizeSql);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);

  const [explainPlan, setExplainPlan] = useState<{ id: number; parent: number; detail: string }[]>([]);
  const [showExplain, setShowExplain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const handleOptimize = async () => {
    if (!activeDbId || !sql.trim()) return;
    await optimizeSql(activeDbId, sql);
  };

  const handleExplainQuery = async () => {
    if (!activeDbId || !sql.trim()) return;
    setLoadingExplain(true);
    try {
      const result = await aiService.explainQuery(activeDbId, sql);
      setExplainPlan(result);
      setShowExplain(true);
    } catch {
      setExplainPlan([]);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleCopy = async () => {
    if (optimizationResult?.sql) {
      await navigator.clipboard.writeText(optimizationResult.sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-secondary)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--color-warning)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">SQL 优化分析</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExplainQuery}
            disabled={!sql.trim() || loadingExplain}
            className="px-2 py-1 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors disabled:opacity-50"
          >
            {loadingExplain ? <Loader2 className="h-3 w-3 animate-spin" /> : 'EXPLAIN'}
          </button>
          <button
            onClick={handleOptimize}
            disabled={!sql.trim() || isGenerating}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
            AI 优化
          </button>
          {onClose && (
            <button
              onClick={() => { clearOptimization(); onClose(); }}
              className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showExplain && explainPlan.length > 0 && (
        <div className="border-b border-[var(--color-border)] p-3">
          <button
            onClick={() => setShowExplain(!showExplain)}
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] mb-2"
          >
            {showExplain ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            EXPLAIN QUERY PLAN
          </button>
          <div className="rounded-md bg-[var(--color-bg-primary)] p-2 font-mono text-xs text-[var(--color-text-primary)]">
            {explainPlan.map((row, idx) => (
              <div key={idx} className="flex gap-2 py-0.5" style={{ paddingLeft: `${row.parent * 16}px` }}>
                <span className="text-[var(--color-text-muted)] shrink-0">{row.id}.</span>
                <span>{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {optimizationResult && (
        <div className="p-3">
          <div className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap mb-3">
            {optimizationResult.content}
          </div>
          {optimizationResult.sql && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUseSql?.(optimizationResult.sql!)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                使用优化 SQL
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-[var(--color-success)]" /> : <Copy className="h-3 w-3" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          )}
        </div>
      )}

      {!optimizationResult && !isGenerating && (
        <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
          点击「AI 优化」分析当前 SQL 并获取优化建议
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center justify-center gap-2 p-4">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
          <span className="text-xs text-[var(--color-text-muted)]">正在分析...</span>
        </div>
      )}
    </div>
  );
}
