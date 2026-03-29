import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { MessageSquare, User, Bot, Send, Loader2, Trash2, Play } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useSqlEditorStore } from '@/stores/sqlEditorStore';

interface DataQaPanelProps {
  onExecuteSql?: (sql: string) => void;
}

export function DataQaPanel({ onExecuteSql }: DataQaPanelProps) {
  const isConfigured = useAiStore((s) => s.isConfigured);
  const isGenerating = useAiStore((s) => s.isGenerating);
  const qaConversation = useAiStore((s) => s.qaConversation);
  const dataQa = useAiStore((s) => s.dataQa);
  const clearQaConversation = useAiStore((s) => s.clearQaConversation);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const activeTabId = useSqlEditorStore((s) => s.activeTabId);
  const updateContent = useSqlEditorStore((s) => s.updateContent);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaConversation]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating || !activeDbId) return;
    const question = input.trim();
    setInput('');
    await dataQa(activeDbId, question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleUseSql = (sql: string) => {
    updateContent(activeTabId, sql);
  };

  const handleExecuteSql = (sql: string) => {
    if (onExecuteSql) {
      onExecuteSql(sql);
    } else {
      updateContent(activeTabId, sql);
    }
  };

  const extractSqlFromContent = (content: string): string | null => {
    const match = content.match(/```sql\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        <MessageSquare className="h-8 w-8 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">AI 功能未配置</p>
        <p className="text-xs text-[var(--color-text-muted)]">请在设置中配置 AI 提供商</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">数据问答</span>
        </div>
        {qaConversation.length > 0 && (
          <button
            onClick={clearQaConversation}
            className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
            title="清空对话"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {qaConversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <Bot className="h-8 w-8 text-[var(--color-text-muted)]" />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-[var(--color-text-secondary)]">用自然语言提问数据相关问题</p>
              <p className="text-xs text-[var(--color-text-muted)]">AI 会自动生成 SQL、执行查询并汇总结果</p>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
              {['这个表有多少条记录？', '找出最近 7 天的数据', '按类别统计数量'].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 text-xs rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {qaConversation.map((message, index) => {
              const sql = message.role === 'assistant' ? extractSqlFromContent(message.content) : null;
              return (
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
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <div
                      className={clsx(
                        'rounded-lg px-3 py-2 text-sm',
                        message.role === 'user'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {sql && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUseSql(sql)}
                          className="px-2 py-0.5 text-[10px] rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                          使用 SQL
                        </button>
                        <button
                          onClick={() => handleExecuteSql(sql)}
                          className="flex items-center gap-0.5 px-2 py-0.5 text-[10px] rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                        >
                          <Play className="h-2.5 w-2.5" />
                          执行
                        </button>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
                      <User className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
                    </div>
                  )}
                </div>
              );
            })}
            {isGenerating && (
              <div className="flex gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
                </div>
                <div className="rounded-lg bg-[var(--color-bg-tertiary)] px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入关于数据的问题..."
            disabled={isGenerating || !activeDbId}
            className="flex-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating || !activeDbId}
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
