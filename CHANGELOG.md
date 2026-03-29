# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-29

### Added

#### Core Features
- SQLite database file opening via file dialog and drag-and-drop
- Table/View/Index schema browsing with sidebar navigation
- Data grid with virtual scrolling for large tables (100K+ rows)
- Pagination, sorting, and filtering support
- Cell-level data editing with type-safe input
- Row insertion and deletion
- Multi-database tab management

#### SQL Editor
- Monaco-based SQL editor with syntax highlighting
- SQL execution with result display
- Multi-tab SQL editing
- SQL execution history with search

#### AI Features (11 platform presets)
- Natural language to SQL generation
- SQL explanation
- SQL error auto-fix
- SQL optimization suggestions with EXPLAIN QUERY PLAN visualization
- Data intelligent Q&A with multi-round conversation
- Table structure AI analysis with caching

#### Export
- CSV export
- JSON export
- Excel (.xlsx) export

#### Settings
- Theme switching (Light / Dark / System)
- Language selection (Chinese / English)
- Editor preferences (font, size, tab size, word wrap, minimap)
- Customizable keyboard shortcuts with conflict detection
- AI provider configuration with connection testing

#### Platform
- macOS native application (Apple Silicon + Intel)
- Tauri 2.x framework
- Minimum macOS 11.0 support

### Supported AI Platforms
- OpenAI (GPT-4o, GPT-4o-mini)
- DeepSeek (V3, R1)
- Anthropic Claude (3.5 Sonnet, 3 Haiku)
- Google Gemini (2.0 Flash, 1.5 Pro)
- Qwen (Plus, Turbo)
- Moonshot (v1-8k, v1-32k)
- Zhipu GLM (4-Plus, 4-Flash)
- Baichuan (Baichuan4, Baichuan3-Turbo)
- Yi (yi-lightning, yi-large)
- Ollama (local models)
- Custom OpenAI-compatible endpoints
