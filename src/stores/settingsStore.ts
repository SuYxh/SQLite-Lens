import { create } from 'zustand';
import * as configService from '@/services/config';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  defaultPageSize: number;
  editorFontSize: number;
  editorFontFamily: string;
  editorTabSize: number;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  keyboardShortcuts: { [id: string]: string };
  autoOpenLastFile: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'zh' | 'en') => void;
  setDefaultPageSize: (size: number) => void;
  setEditorFontSize: (size: number) => void;
  setEditorTabSize: (size: number) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'system',
  language: 'zh',
  defaultPageSize: 100,
  editorFontSize: 14,
  editorFontFamily: 'JetBrains Mono, Fira Code, monospace',
  editorTabSize: 2,
  editorWordWrap: true,
  editorMinimap: false,
  keyboardShortcuts: {},
  autoOpenLastFile: true,

  setTheme: (theme) => {
    set({ theme });
  },

  setLanguage: (lang) => {
    set({ language: lang });
  },

  setDefaultPageSize: (size) => {
    set({ defaultPageSize: size });
  },

  setEditorFontSize: (size) => {
    set({ editorFontSize: size });
  },

  setEditorTabSize: (size) => {
    set({ editorTabSize: size });
  },

  loadSettings: async () => {
    try {
      const config = await configService.getConfig();
      if (config?.general) {
        set({
          theme: config.general.theme ?? 'system',
          language: config.general.language ?? 'zh',
          defaultPageSize: config.general.default_page_size ?? 100,
          autoOpenLastFile: config.general.auto_open_last_file ?? true,
        });
      }
      if (config?.editor) {
        set({
          editorFontSize: config.editor.font_size ?? 14,
          editorFontFamily: config.editor.font_family ?? 'JetBrains Mono, Fira Code, monospace',
          editorTabSize: config.editor.tab_size ?? 2,
          editorWordWrap: config.editor.word_wrap === 'on',
          editorMinimap: config.editor.minimap ?? false,
        });
      }
      if (config?.keyboard_shortcuts) {
        set({ keyboardShortcuts: config.keyboard_shortcuts });
      }
    } catch (_e) {
      // keep defaults
    }
  },

  saveSettings: async () => {
    const { theme, language, defaultPageSize, editorFontSize, editorFontFamily, editorTabSize, editorWordWrap, editorMinimap, autoOpenLastFile, keyboardShortcuts } = get();
    await configService.setConfig({
      general: {
        theme,
        language,
        default_page_size: defaultPageSize,
        auto_open_last_file: autoOpenLastFile,
      },
      editor: {
        font_size: editorFontSize,
        font_family: editorFontFamily,
        tab_size: editorTabSize,
        word_wrap: editorWordWrap ? 'on' : 'off',
        minimap: editorMinimap,
      },
      keyboard_shortcuts: keyboardShortcuts,
      recent_files: [],
    });
  },
}));
