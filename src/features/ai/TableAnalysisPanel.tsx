import { useEffect } from 'react';
import { Brain, Loader2, RefreshCw } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useTableStore } from '@/stores/tableStore';

export function TableAnalysisPanel() {
  const isConfigured = useAiStore((s) => s.isConfigured);
  const isAnalyzing = useAiStore((s) => s.isAnalyzing);
  const tableAnalysis = useAiStore((s) => s.tableAnalysis);
  const analyzeTable = useAiStore((s) => s.analyzeTable);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const selectedTable = useTableStore((s) => s.selectedTable);

  const analysis = selectedTable ? tableAnalysis[selectedTable] : null;

  useEffect(() => {
    if (isConfigured && activeDbId && selectedTable && !analysis && !isAnalyzing) {
      analyzeTable(activeDbId, selectedTable);
    }
  }, [isConfigured, activeDbId, selectedTable, analysis, isAnalyzing, analyzeTable]);

  const handleRefresh = () => {
    if (!activeDbId || !selectedTable) return;
    analyzeTable(activeDbId, selectedTable);
  };

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Brain className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">AI 功能未配置</p>
        <p className="text-xs text-[var(--color-text-muted)]">请在设置中配置 AI 提供商以使用表分析功能</p>
      </div>
    );
  }

  if (!selectedTable) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Brain className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">请选择一个表</p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">正在分析表 {selectedTable}...</p>
        <p className="text-xs text-[var(--color-text-muted)]">AI 正在检查表结构、数据质量和索引</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Brain className="h-8 w-8 text-[var(--color-text-muted)]" />
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          <Brain className="h-3.5 w-3.5" />
          分析表结构
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            表分析: {selectedTable}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {new Date(analysis.timestamp).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed prose-sm">
          {analysis.content}
        </div>
      </div>
    </div>
  );
}
