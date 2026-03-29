export type AiPlatformId = 'openai' | 'deepseek' | 'anthropic' | 'google' | 'qwen' | 'moonshot' | 'zhipu' | 'baichuan' | 'yi' | 'ollama' | 'custom';

export interface AiModelPreset {
  id: string;
  name: string;
  description: string;
  max_tokens: number;
  is_recommended: boolean;
  context_window: number;
}

export interface AiPlatform {
  id: AiPlatformId;
  name: string;
  icon: string;
  base_url: string;
  api_key_required: boolean;
  api_key_url: string;
  description: string;
  models: AiModelPreset[];
  protocol: 'OpenAICompatible' | 'Anthropic' | 'GoogleGemini' | 'Ollama';
  default_headers: [string, string][];
}

export interface AiProviderConfig {
  platform_id: AiPlatformId;
  api_key: string;
  model: string;
  custom_base_url: string;
  custom_headers: [string, string][];
}

export interface AiResponse {
  content: string;
  sql: string | null;
}

export interface AiSuggestion {
  type: 'generate' | 'explain' | 'fix';
  content: string;
  sql: string | null;
  timestamp: number;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ExplainQueryPlanRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}
