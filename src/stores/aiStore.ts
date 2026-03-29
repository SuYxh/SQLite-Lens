import { create } from 'zustand';
import type { AiPlatform, AiProviderConfig, AiSuggestion, AiMessage } from '@/types/ai';
import * as aiService from '@/services/ai';

interface AiState {
  isConfigured: boolean;
  activeProvider: AiProviderConfig | null;
  builtinPlatforms: AiPlatform[];
  isGenerating: boolean;
  lastSuggestion: AiSuggestion | null;
  conversationHistory: AiMessage[];
  error: string | null;
  optimizationResult: AiSuggestion | null;
  tableAnalysis: { [tableName: string]: { content: string; timestamp: number } };
  qaConversation: AiMessage[];
  isAnalyzing: boolean;
  loadPlatforms: () => Promise<void>;
  loadConfig: () => Promise<void>;
  setProvider: (config: AiProviderConfig) => Promise<void>;
  testConnection: (platformId: string, apiKey: string, model: string, customBaseUrl?: string) => Promise<boolean>;
  generateSql: (dbId: string, text: string) => Promise<void>;
  explainSql: (dbId: string, sql: string) => Promise<void>;
  fixError: (dbId: string, sql: string, error: string) => Promise<void>;
  clearSuggestion: () => void;
  clearError: () => void;
  optimizeSql: (dbId: string, sql: string) => Promise<void>;
  analyzeTable: (dbId: string, tableName: string) => Promise<void>;
  dataQa: (dbId: string, question: string) => Promise<void>;
  clearQaConversation: () => void;
  clearOptimization: () => void;
  clearTableAnalysis: (tableName: string) => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  isConfigured: false,
  activeProvider: null,
  builtinPlatforms: [],
  isGenerating: false,
  lastSuggestion: null,
  conversationHistory: [],
  error: null,
  optimizationResult: null,
  tableAnalysis: {},
  qaConversation: [],
  isAnalyzing: false,

  loadPlatforms: async () => {
    try {
      const platforms = await aiService.getBuiltinPlatforms();
      set({ builtinPlatforms: platforms });
    } catch (e) {
      set({ error: (e as Error).message || String(e) });
    }
  },

  loadConfig: async () => {
    try {
      const config = await aiService.getAiConfig();
      set({
        activeProvider: config,
        isConfigured: config !== null,
      });
    } catch (_e) {
      set({ isConfigured: false, activeProvider: null });
    }
  },

  setProvider: async (config: AiProviderConfig) => {
    try {
      await aiService.saveAiConfig(config);
      set({ activeProvider: config, isConfigured: true, error: null });
    } catch (e) {
      set({ error: (e as Error).message || String(e) });
    }
  },

  testConnection: async (platformId: string, apiKey: string, model: string, customBaseUrl?: string) => {
    try {
      set({ error: null });
      const result = await aiService.testConnection(platformId, apiKey, model, customBaseUrl);
      return result;
    } catch (e) {
      set({ error: (e as Error).message || String(e) });
      return false;
    }
  },

  generateSql: async (dbId: string, text: string) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await aiService.generateSql(dbId, text);
      const suggestion: AiSuggestion = {
        type: 'generate',
        content: response.content,
        sql: response.sql,
        timestamp: Date.now(),
      };
      const userMessage: AiMessage = { role: 'user', content: text, timestamp: Date.now() };
      const assistantMessage: AiMessage = { role: 'assistant', content: response.content, timestamp: Date.now() };
      set((state) => ({
        lastSuggestion: suggestion,
        conversationHistory: [...state.conversationHistory, userMessage, assistantMessage],
        isGenerating: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e), isGenerating: false });
    }
  },

  explainSql: async (dbId: string, sql: string) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await aiService.explainSql(dbId, sql);
      const suggestion: AiSuggestion = {
        type: 'explain',
        content: response.content,
        sql: response.sql,
        timestamp: Date.now(),
      };
      const userMessage: AiMessage = { role: 'user', content: `Explain: ${sql}`, timestamp: Date.now() };
      const assistantMessage: AiMessage = { role: 'assistant', content: response.content, timestamp: Date.now() };
      set((state) => ({
        lastSuggestion: suggestion,
        conversationHistory: [...state.conversationHistory, userMessage, assistantMessage],
        isGenerating: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e), isGenerating: false });
    }
  },

  fixError: async (dbId: string, sql: string, error: string) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await aiService.fixError(dbId, sql, error);
      const suggestion: AiSuggestion = {
        type: 'fix',
        content: response.content,
        sql: response.sql,
        timestamp: Date.now(),
      };
      const userMessage: AiMessage = { role: 'user', content: `Fix error: ${error}\nSQL: ${sql}`, timestamp: Date.now() };
      const assistantMessage: AiMessage = { role: 'assistant', content: response.content, timestamp: Date.now() };
      set((state) => ({
        lastSuggestion: suggestion,
        conversationHistory: [...state.conversationHistory, userMessage, assistantMessage],
        isGenerating: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e), isGenerating: false });
    }
  },

  clearSuggestion: () => {
    set({ lastSuggestion: null });
  },

  clearError: () => {
    set({ error: null });
  },

  optimizeSql: async (dbId: string, sql: string) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await aiService.optimizeSql(dbId, sql);
      const suggestion: AiSuggestion = {
        type: 'fix',
        content: response.content,
        sql: response.sql,
        timestamp: Date.now(),
      };
      set({ optimizationResult: suggestion, isGenerating: false });
    } catch (e) {
      set({ error: (e as Error).message || String(e), isGenerating: false });
    }
  },

  analyzeTable: async (dbId: string, tableName: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const response = await aiService.analyzeTable(dbId, tableName);
      set((state) => ({
        tableAnalysis: {
          ...state.tableAnalysis,
          [tableName]: { content: response.content, timestamp: Date.now() },
        },
        isAnalyzing: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e), isAnalyzing: false });
    }
  },

  dataQa: async (dbId: string, question: string) => {
    set({ isGenerating: true, error: null });
    try {
      const currentQa = get().qaConversation;
      const history = currentQa.map((m) => ({ role: m.role, content: m.content }));
      const response = await aiService.dataQa(dbId, question, history);
      const userMsg: AiMessage = { role: 'user', content: question, timestamp: Date.now() };
      const assistantMsg: AiMessage = { role: 'assistant', content: response.content, timestamp: Date.now() };
      set((state) => ({
        qaConversation: [...state.qaConversation, userMsg, assistantMsg],
        lastSuggestion: response.sql ? { type: 'generate', content: response.content, sql: response.sql, timestamp: Date.now() } : null,
        isGenerating: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message || String(e), isGenerating: false });
    }
  },

  clearQaConversation: () => {
    set({ qaConversation: [] });
  },

  clearOptimization: () => {
    set({ optimizationResult: null });
  },

  clearTableAnalysis: (tableName: string) => {
    set((state) => {
      const newAnalysis = { ...state.tableAnalysis };
      delete newAnalysis[tableName];
      return { tableAnalysis: newAnalysis };
    });
  },
}));
