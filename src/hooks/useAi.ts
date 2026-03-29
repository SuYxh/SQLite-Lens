import { useAiStore } from '@/stores/aiStore';
import { useDatabaseStore } from '@/stores/databaseStore';

export function useAi() {
  const isConfigured = useAiStore((s) => s.isConfigured);
  const isGenerating = useAiStore((s) => s.isGenerating);
  const lastSuggestion = useAiStore((s) => s.lastSuggestion);
  const error = useAiStore((s) => s.error);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);

  const generateSql = async (text: string) => {
    if (!activeDbId) return;
    await useAiStore.getState().generateSql(activeDbId, text);
  };

  const explainSql = async (sql: string) => {
    if (!activeDbId) return;
    await useAiStore.getState().explainSql(activeDbId, sql);
  };

  const fixError = async (sql: string, errorMsg: string) => {
    if (!activeDbId) return;
    await useAiStore.getState().fixError(activeDbId, sql, errorMsg);
  };

  const clearSuggestion = () => {
    useAiStore.getState().clearSuggestion();
  };

  return {
    isConfigured,
    isGenerating,
    lastSuggestion,
    error,
    generateSql,
    explainSql,
    fixError,
    clearSuggestion,
  };
}
