export interface GeneralConfig {
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  default_page_size: number;
  auto_open_last_file: boolean;
}

export interface EditorConfig {
  font_size: number;
  font_family: string;
  tab_size: number;
  word_wrap: string;
  minimap: boolean;
}

export interface RecentFile {
  path: string;
  name: string;
  size: number;
  last_opened: string;
}

export interface AiConfig {
  platform_id: string;
  model: string;
  custom_base_url: string;
  custom_headers: [string, string][];
}

export interface AppConfig {
  general: GeneralConfig;
  editor: EditorConfig;
  recent_files: RecentFile[];
  ai?: AiConfig;
}
