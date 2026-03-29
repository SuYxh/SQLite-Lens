import { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo, Component, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { PanelLeft, Database, Code, Table2, Settings, Sparkles, Zap, MessageSquare, Brain } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUiStore } from '@/stores/uiStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useSqlEditorStore } from '@/stores/sqlEditorStore';
import { useAiStore } from '@/stores/aiStore';
import WelcomePage from '@/features/welcome/WelcomePage';
import TableList from '@/features/database/TableList';
import { DatabaseTabBar } from '@/components/layout/DatabaseTabBar';
import { DropOverlay } from '@/components/shared/DropOverlay';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const TableStructure = lazy(() => import('@/features/database/TableStructure'));
const DataGrid = lazy(() => import('@/features/data-grid/DataGrid'));
const SqlEditor = lazy(() => import('@/features/sql-editor/SqlEditor'));
const SqlResult = lazy(() => import('@/features/sql-editor/SqlResult'));
const SettingsDialog = lazy(() => import('@/features/settings/SettingsDialog').then((m) => ({ default: m.SettingsDialog })));
const SqlEditorTabs = lazy(() => import('@/features/sql-editor/SqlEditorTabs').then((m) => ({ default: m.SqlEditorTabs })));
const SqlHistory = lazy(() => import('@/features/sql-editor/SqlHistory').then((m) => ({ default: m.SqlHistory })));
const NaturalLanguageInput = lazy(() => import('@/features/ai/NaturalLanguageInput').then((m) => ({ default: m.NaturalLanguageInput })));
const AiSuggestionDisplay = lazy(() => import('@/features/ai/AiSuggestion').then((m) => ({ default: m.AiSuggestion })));
const SqlOptimizePanel = lazy(() => import('@/features/ai/SqlOptimizePanel').then((m) => ({ default: m.SqlOptimizePanel })));
const DataQaPanel = lazy(() => import('@/features/ai/DataQaPanel').then((m) => ({ default: m.DataQaPanel })));
const TableAnalysisPanel = lazy(() => import('@/features/ai/TableAnalysisPanel').then((m) => ({ default: m.TableAnalysisPanel })));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size="sm" />
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-bg-primary">
          <div className="text-center p-8">
            <h2 className="text-lg font-semibold text-error mb-2">
              Something went wrong
            </h2>
            <p className="text-text-muted text-sm mb-4">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type AiPanelType = 'optimize' | 'qa' | 'analysis' | null;

const TitleBar = memo(function TitleBar({
  onOpenSettings,
  aiPanel,
  onToggleAiPanel,
}: {
  onOpenSettings: () => void;
  aiPanel: AiPanelType;
  onToggleAiPanel: (panel: AiPanelType) => void;
}) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const activeView = useUiStore((s) => s.activeView);
  const setActiveView = useUiStore((s) => s.setActiveView);
  const isConfigured = useAiStore((s) => s.isConfigured);

  const views = useMemo(
    () => [
      { key: 'data' as const, label: 'Data', icon: Table2 },
      { key: 'structure' as const, label: 'Structure', icon: Database },
      { key: 'sql' as const, label: 'SQL', icon: Code },
    ],
    []
  );

  return (
    <div
      data-tauri-drag-region
      className="flex items-center h-10 border-b border-border bg-bg-secondary px-2 shrink-0 select-none"
    >
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors mr-2"
      >
        <PanelLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-0.5">
        {views.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === key
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" data-tauri-drag-region />

      <div className="flex items-center gap-1">
        {isConfigured && (
          <>
            <button
              onClick={() => onToggleAiPanel(aiPanel === 'optimize' ? null : 'optimize')}
              className={`p-1.5 rounded-md transition-colors ${
                aiPanel === 'optimize' ? 'bg-warning/10 text-warning' : 'text-text-secondary hover:bg-bg-tertiary'
              }`}
              title="SQL 优化"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleAiPanel(aiPanel === 'qa' ? null : 'qa')}
              className={`p-1.5 rounded-md transition-colors ${
                aiPanel === 'qa' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-tertiary'
              }`}
              title="数据问答"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleAiPanel(aiPanel === 'analysis' ? null : 'analysis')}
              className={`p-1.5 rounded-md transition-colors ${
                aiPanel === 'analysis' ? 'bg-success/10 text-success' : 'text-text-secondary hover:bg-bg-tertiary'
              }`}
              title="表分析"
            >
              <Brain className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent text-xs mr-1">
              <Sparkles className="w-3 h-3" />
              AI
            </div>
          </>
        )}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

function SqlEditorView() {
  const activeTabId = useSqlEditorStore((s) => s.activeTabId);
  const tabs = useSqlEditorStore((s) => s.tabs);
  const updateContent = useSqlEditorStore((s) => s.updateContent);
  const executeQuery = useSqlEditorStore((s) => s.executeQuery);
  const isConfigured = useAiStore((s) => s.isConfigured);
  const lastSuggestion = useAiStore((s) => s.lastSuggestion);
  const clearSuggestion = useAiStore((s) => s.clearSuggestion);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptimize, setShowOptimize] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleExecute = useCallback(() => {
    executeQuery(activeTabId);
  }, [executeQuery, activeTabId]);

  const handleChange = useCallback(
    (value: string) => {
      updateContent(activeTabId, value);
    },
    [updateContent, activeTabId]
  );

  const handleUseSql = useCallback(
    (sql: string) => {
      updateContent(activeTabId, sql);
      clearSuggestion();
    },
    [updateContent, activeTabId, clearSuggestion]
  );

  const handleExecuteSql = useCallback(
    (sql: string) => {
      updateContent(activeTabId, sql);
      clearSuggestion();
      executeQuery(activeTabId, sql);
    },
    [updateContent, activeTabId, clearSuggestion, executeQuery]
  );

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<LazyFallback />}>
        <SqlEditorTabs onToggleHistory={() => setShowHistory(!showHistory)} />
      </Suspense>
      {isConfigured && (
        <Suspense fallback={null}>
          <NaturalLanguageInput />
        </Suspense>
      )}
      {lastSuggestion && (
        <Suspense fallback={null}>
          <AiSuggestionDisplay
            suggestion={lastSuggestion}
            onUse={handleUseSql}
            onExecute={handleExecuteSql}
            onDismiss={clearSuggestion}
          />
        </Suspense>
      )}
      {showOptimize && activeTab?.content && (
        <Suspense fallback={null}>
          <div className="p-2 border-b border-border">
            <SqlOptimizePanel
              sql={activeTab.content}
              onUseSql={handleUseSql}
              onClose={() => setShowOptimize(false)}
            />
          </div>
        </Suspense>
      )}
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0">
            <Suspense fallback={<LazyFallback />}>
              <SqlEditor
                value={activeTab?.content ?? ''}
                onChange={handleChange}
                onExecute={handleExecute}
              />
            </Suspense>
          </div>
          <div className="h-px bg-border" />
          <div className="flex-1 min-h-0">
            <Suspense fallback={<LazyFallback />}>
              <SqlResult />
            </Suspense>
          </div>
        </div>
        {showHistory && (
          <div className="w-72 border-l border-border shrink-0">
            <Suspense fallback={<LazyFallback />}>
              <SqlHistory onClose={() => setShowHistory(false)} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

const MainContent = memo(function MainContent() {
  const activeView = useUiStore((s) => s.activeView);

  return (
    <Suspense fallback={<LazyFallback />}>
      {activeView === 'data' && <DataGrid />}
      {activeView === 'structure' && <TableStructure />}
      {activeView === 'sql' && <SqlEditorView />}
    </Suspense>
  );
});

function AiSidePanel({ panel, onClose }: { panel: AiPanelType; onClose: () => void }) {
  const activeTabId = useSqlEditorStore((s) => s.activeTabId);
  const updateContent = useSqlEditorStore((s) => s.updateContent);
  const executeQuery = useSqlEditorStore((s) => s.executeQuery);

  const handleExecuteSql = useCallback(
    (sql: string) => {
      updateContent(activeTabId, sql);
      executeQuery(activeTabId, sql);
    },
    [updateContent, executeQuery, activeTabId]
  );

  if (!panel) return null;

  return (
    <div className="w-80 border-l border-border shrink-0 bg-bg-secondary">
      <Suspense fallback={<LazyFallback />}>
        {panel === 'qa' && <DataQaPanel onExecuteSql={handleExecuteSql} />}
        {panel === 'analysis' && <TableAnalysisPanel />}
        {panel === 'optimize' && (
          <div className="p-3">
            <SqlOptimizePanel
              sql={useSqlEditorStore.getState().tabs.find((t) => t.id === activeTabId)?.content ?? ''}
              onUseSql={(sql) => updateContent(activeTabId, sql)}
              onClose={onClose}
            />
          </div>
        )}
      </Suspense>
    </div>
  );
}

function AppLayout({
  onOpenSettings,
  aiPanel,
  onToggleAiPanel,
}: {
  onOpenSettings: () => void;
  aiPanel: AiPanelType;
  onToggleAiPanel: (panel: AiPanelType) => void;
}) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const sidebarWidth = useUiStore((s) => s.sidebarWidth);
  const databases = useDatabaseStore((s) => s.databases);

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <TitleBar onOpenSettings={onOpenSettings} aiPanel={aiPanel} onToggleAiPanel={onToggleAiPanel} />
      {databases.length > 1 && <DatabaseTabBar />}
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <div
            className="border-r border-border bg-bg-secondary shrink-0"
            style={{ width: sidebarWidth }}
          >
            <TableList />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <MainContent />
        </div>
        <AiSidePanel panel={aiPanel} onClose={() => onToggleAiPanel(null)} />
      </div>
    </div>
  );
}

export default function App() {
  useTheme();
  const { isDragging } = useDragDrop();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiPanel, setAiPanel] = useState<AiPanelType>(null);
  const showWelcome = useUiStore((s) => s.showWelcome);
  const setShowWelcome = useUiStore((s) => s.setShowWelcome);
  const databases = useDatabaseStore((s) => s.databases);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadPlatforms = useAiStore((s) => s.loadPlatforms);
  const loadAiConfig = useAiStore((s) => s.loadConfig);

  useEffect(() => {
    loadSettings();
    loadPlatforms();
    loadAiConfig();
  }, [loadSettings, loadPlatforms, loadAiConfig]);

  useEffect(() => {
    if (databases.length > 0) {
      setShowWelcome(false);
    }
  }, [databases.length, setShowWelcome]);

  const shouldShowWelcome = showWelcome && databases.length === 0;

  const handleToggleAiPanel = useCallback((panel: AiPanelType) => {
    setAiPanel(panel);
  }, []);

  return (
    <ErrorBoundary>
      {shouldShowWelcome ? (
        <WelcomePage />
      ) : (
        <AppLayout
          onOpenSettings={() => setSettingsOpen(true)}
          aiPanel={aiPanel}
          onToggleAiPanel={handleToggleAiPanel}
        />
      )}
      <DropOverlay visible={isDragging} />
      <Suspense fallback={null}>
        {settingsOpen && (
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </Suspense>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-bg-secondary !text-text-primary !border !border-border !shadow-lg',
          duration: 3000,
        }}
      />
    </ErrorBoundary>
  );
}
