import { invoke } from '@tauri-apps/api/core';
import type { AiPlatform, AiProviderConfig, AiResponse, ExplainQueryPlanRow } from '@/types/ai';

export async function getBuiltinPlatforms(): Promise<AiPlatform[]> {
  return invoke<AiPlatform[]>('get_builtin_platforms_cmd');
}

export async function testConnection(
  platformId: string,
  apiKey: string,
  model: string,
  customBaseUrl?: string
): Promise<boolean> {
  return invoke<boolean>('ai_test_connection', {
    platformId,
    apiKey,
    model,
    customBaseUrl: customBaseUrl || null,
  });
}

export async function generateSql(dbId: string, text: string): Promise<AiResponse> {
  return invoke<AiResponse>('ai_generate_sql', { dbId, text });
}

export async function explainSql(dbId: string, sql: string): Promise<AiResponse> {
  return invoke<AiResponse>('ai_explain_sql', { dbId, sql });
}

export async function fixError(dbId: string, sql: string, error: string): Promise<AiResponse> {
  return invoke<AiResponse>('ai_fix_error', { dbId, sql, error });
}

export async function optimizeSql(dbId: string, sql: string): Promise<AiResponse> {
  return invoke<AiResponse>('ai_optimize_sql', { dbId, sql });
}

export async function explainQuery(dbId: string, sql: string): Promise<ExplainQueryPlanRow[]> {
  return invoke<ExplainQueryPlanRow[]>('explain_query', { dbId, sql });
}

export async function analyzeTable(dbId: string, tableName: string): Promise<AiResponse> {
  return invoke<AiResponse>('ai_analyze_table', { dbId, tableName });
}

export async function dataQa(
  dbId: string,
  question: string,
  conversationHistory: { role: string; content: string }[]
): Promise<AiResponse> {
  return invoke<AiResponse>('ai_data_qa', { dbId, question, conversationHistory });
}

export async function summarizeResults(
  question: string,
  sql: string,
  results: string
): Promise<AiResponse> {
  return invoke<AiResponse>('ai_summarize_results', { question, sql, results });
}

export async function saveAiConfig(config: AiProviderConfig): Promise<void> {
  return invoke<void>('save_ai_config', { config });
}

export async function getAiConfig(): Promise<AiProviderConfig | null> {
  return invoke<AiProviderConfig | null>('get_ai_config');
}

export const aiService = {
  getBuiltinPlatforms,
  testConnection,
  generateSql,
  explainSql,
  fixError,
  optimizeSql,
  explainQuery,
  analyzeTable,
  dataQa,
  summarizeResults,
  saveAiConfig,
  getAiConfig,
};
