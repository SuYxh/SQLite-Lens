import Editor, { type OnMount } from '@monaco-editor/react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import { useCallback, useRef } from 'react';
import type { editor } from 'monaco-editor';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
}

export default function SqlEditor({ value, onChange, onExecute }: SqlEditorProps) {
  const { isDark } = useTheme();
  const editorFontSize = useSettingsStore((s) => s.editorFontSize);
  const editorFontFamily = useSettingsStore((s) => s.editorFontFamily);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;
      editorInstance.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          onExecute();
        }
      );
    },
    [onExecute]
  );

  return (
    <div className="h-full w-full">
      <Editor
        language="sql"
        theme={isDark ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          fontSize: editorFontSize,
          fontFamily: editorFontFamily,
          minimap: { enabled: false },
          lineNumbers: 'on',
          wordWrap: 'off',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12 },
        }}
      />
    </div>
  );
}
