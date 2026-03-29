import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, ExternalLink, Check, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAiStore } from '@/stores/aiStore';
import type { AiPlatform, AiPlatformId } from '@/types/ai';

export function AiProviderSettings() {
  const builtinPlatforms = useAiStore((s) => s.builtinPlatforms);
  const activeProvider = useAiStore((s) => s.activeProvider);
  const loadPlatforms = useAiStore((s) => s.loadPlatforms);
  const setProvider = useAiStore((s) => s.setProvider);
  const testConnection = useAiStore((s) => s.testConnection);

  const [selectedPlatform, setSelectedPlatform] = useState<AiPlatform | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [customHeaders, setCustomHeaders] = useState<[string, string][]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  const handleSelectPlatform = (platform: AiPlatform) => {
    setSelectedPlatform(platform);
    setApiKey('');
    setShowApiKey(false);
    setCustomModel('');
    setUseCustomModel(false);
    setCustomBaseUrl(platform.base_url);
    setCustomHeaders([...platform.default_headers]);
    setTestResult(null);

    if (activeProvider && activeProvider.platform_id === platform.id) {
      setApiKey(activeProvider.api_key);
      const modelExists = platform.models.some((m) => m.id === activeProvider.model);
      if (modelExists) {
        setSelectedModel(activeProvider.model);
        setUseCustomModel(false);
      } else {
        setCustomModel(activeProvider.model);
        setUseCustomModel(true);
      }
      if (activeProvider.custom_base_url) {
        setCustomBaseUrl(activeProvider.custom_base_url);
      }
      if (activeProvider.custom_headers.length > 0) {
        setCustomHeaders([...activeProvider.custom_headers]);
      }
    } else {
      const recommended = platform.models.find((m) => m.is_recommended);
      setSelectedModel(recommended?.id ?? platform.models[0]?.id ?? '');
    }
  };

  const handleTest = async () => {
    if (!selectedPlatform) return;
    setIsTesting(true);
    setTestResult(null);
    const model = useCustomModel ? customModel : selectedModel;
    const baseUrl = selectedPlatform.id === 'custom' ? customBaseUrl : undefined;
    const result = await testConnection(selectedPlatform.id, apiKey, model, baseUrl);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = async () => {
    if (!selectedPlatform) return;
    setIsSaving(true);
    await setProvider({
      platform_id: selectedPlatform.id as AiPlatformId,
      api_key: apiKey,
      model: useCustomModel ? customModel : selectedModel,
      custom_base_url: selectedPlatform.id === 'custom' ? customBaseUrl : '',
      custom_headers: selectedPlatform.id === 'custom' ? customHeaders : [],
    });
    setIsSaving(false);
  };

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, ['', '']]);
  };

  const handleRemoveHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 0 | 1, value: string) => {
    const updated = [...customHeaders] as [string, string][];
    updated[index] = [...updated[index]] as [string, string];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  if (selectedPlatform) {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => setSelectedPlatform(null)}
          className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors self-start"
        >
          <ChevronLeft className="h-4 w-4" />
          返回平台选择
        </button>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{selectedPlatform.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{selectedPlatform.description}</p>
        </div>

        {selectedPlatform.api_key_required && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">API Key</label>
              {selectedPlatform.api_key_url && (
                <a
                  href={selectedPlatform.api_key_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                >
                  获取 API Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 pr-9 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">模型</label>
          {!useCustomModel ? (
            <div className="flex flex-col gap-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-2 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
              >
                {selectedPlatform.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}{model.is_recommended ? ' ⭐' : ''}
                  </option>
                ))}
              </select>
              {selectedPlatform.models.find((m) => m.id === selectedModel) && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {selectedPlatform.models.find((m) => m.id === selectedModel)?.description}
                </p>
              )}
              <button
                onClick={() => setUseCustomModel(true)}
                className="text-xs text-[var(--color-accent)] hover:underline self-start"
              >
                使用自定义模型名称
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="输入模型名称，如 gpt-4o"
              />
              <button
                onClick={() => setUseCustomModel(false)}
                className="text-xs text-[var(--color-accent)] hover:underline self-start"
              >
                选择预设模型
              </button>
            </div>
          )}
        </div>

        {selectedPlatform.id === 'custom' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Base URL</label>
              <Input
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">自定义 Headers</label>
                <button
                  onClick={handleAddHeader}
                  className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  添加
                </button>
              </div>
              {customHeaders.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={header[0]}
                    onChange={(e) => handleHeaderChange(index, 0, e.target.value)}
                    placeholder="Header 名称"
                    className="flex-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
                  />
                  <input
                    value={header[1]}
                    onChange={(e) => handleHeaderChange(index, 1, e.target.value)}
                    placeholder="Header 值"
                    className="flex-1 h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm px-3 outline-none transition-colors focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
                  />
                  <button
                    onClick={() => handleRemoveHeader(index)}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={isTesting}
            onClick={handleTest}
            disabled={!apiKey && selectedPlatform.api_key_required}
          >
            测试连接
          </Button>
          {testResult === true && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
              <Check className="h-3.5 w-3.5" />
              连接成功
            </span>
          )}
          {testResult === false && (
            <span className="text-xs text-[var(--color-error)]">连接失败</span>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
          <Button variant="secondary" onClick={() => setSelectedPlatform(null)}>
            取消
          </Button>
          <Button
            variant="primary"
            loading={isSaving}
            onClick={handleSave}
            disabled={(!apiKey && selectedPlatform.api_key_required) || (!selectedModel && !customModel)}
          >
            保存并启用
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">选择 AI 平台</h3>
        <p className="text-xs text-[var(--color-text-muted)]">选择一个 AI 服务提供商来启用智能功能</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {builtinPlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleSelectPlatform(platform)}
            className={clsx(
              'flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors',
              activeProvider?.platform_id === platform.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{platform.icon}</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{platform.name}</span>
              {activeProvider?.platform_id === platform.id && (
                <span className="ml-auto rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] text-white">
                  当前
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{platform.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
