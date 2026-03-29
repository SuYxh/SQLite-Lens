import React, { useState } from 'react';
import clsx from 'clsx';
import { Sparkles, User, Bot, Send, Loader2 } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { useAi } from '@/hooks/useAi';
import { AiSuggestion } from './AiSuggestion';

interface AiPanelProps {
  onUseSql?: (sql: string) => void;
  onExecuteSql?: (sql: string) => void;
}

export function AiPanel({ onUseSql, onExecuteSql }: AiPanelProps) {
  const conversationHistory = useAiStore((s) => s.conversationHistory);
  const { isConfigured, isGenerating, lastSuggestion, generateSql, clearSuggestion } = useAi();
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;
    await generateSql(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Sparkles className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">AI 功能未配置</p>
        <p className="text-xs text-[var(--color-text-muted)]">请在设置中配置 AI 提供商</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm font-medium text-[var(--color-text-primary)]">AI 助手</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {conversationHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Bot className="h-6 w-6 text-[var(--color-text-muted)]" />
            <p className="text-xs text-[var(--color-text-muted)]">开始提问，AI 将帮助你生成 SQL</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversationHistory.map((message, index) => (
              <div
                key={index}
                className={clsx(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                    <Bot className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                  </div>
                )}
                <div
                  className={clsx(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
                    <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {lastSuggestion && (
          <div className="mt-3">
            <AiSuggestion
              suggestion={lastSuggestion}
              onUse={(sql) => onUseSql?.(sql)}
              onExecute={(sql) => onExecuteSql?.(sql)}
              onDismiss={clearSuggestion}
            />
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入自然语言查询..."
            disabled={isGenerating}
            className="flex-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className={clsx(
              'flex items-center justify-center rounded-md px-3 h-8 transition-colors',
              'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
