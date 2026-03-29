<div align="center">

# 🔍 SQLite Lens

**秒开本地 SQLite，极简 UI + AI 一键搞定数据操作**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS-lightgrey?logo=apple)](https://github.com/nicekate/sqlite-lens/releases)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-2021-DEA584?logo=rust)](https://www.rust-lang.org)

一款轻量、美观、**AI 赋能**的桌面端 SQLite 数据库查看与管理工具。
打包体积 < 30MB，启动 < 2s，专为开发者打造。

[✨ 功能特性](#-功能特性) · [🚀 快速开始](#-快速开始) · [🤖 AI 能力](#-ai-能力) · [🛠 开发指南](#-开发指南) · [🤝 参与贡献](#-参与贡献)

---

<table>
<tr>
<td width="50%">

**🌙 暗色主题**
> 专业级暗色界面，长时间使用不疲劳

</td>
<td width="50%">

**☀️ 亮色主题**
> 清爽明亮的日间模式，信息一目了然

</td>
</tr>
</table>

</div>

---

## 为什么选择 SQLite Lens？

| | DB Browser for SQLite | DataGrip | Beekeeper Studio | **SQLite Lens** |
|:--|:--:|:--:|:--:|:--:|
| 💰 价格 | 免费 | $24.9/月 | 免费/付费 | **免费开源** |
| 📦 安装包 | ~70MB | ~800MB | ~180MB | **< 30MB** |
| ⚡ 启动速度 | 3-5s | 10s+ | 中等 | **< 2s** |
| 🎨 UI 美观度 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **⭐⭐⭐⭐⭐** |
| 🤖 AI 能力 | ❌ | 基础 | ❌ | **✅ 原生深度集成** |
| 🔒 隐私安全 | ✅ | ❌ 需联网 | 部分 | **✅ 完全本地** |

> **核心差异**：SQLite Lens 不是一个通用数据库工具。它**只做 SQLite**，并把每一个细节打磨到极致。AI 不是附加功能，而是深度融入你的每一步操作。

---

## ✨ 功能特性

### 📊 数据浏览

- **虚拟滚动** — 10 万行数据丝滑滚动，60fps 不掉帧
- **智能筛选** — 支持等于、包含、大于、为空等多条件组合筛选
- **灵活排序** — 单列/多列排序，升降序一键切换
- **分页浏览** — 自定义每页行数（50 / 100 / 500 / 1000）
- **拖拽打开** — 把 `.db` / `.sqlite` 文件直接拖进窗口

### ✏️ 数据编辑

- **单元格编辑** — 双击即改，类型安全校验
- **新增行** — 表单式新增，自动匹配列类型
- **批量删除** — 多选行一键删除，操作前确认
- **长文本查看** — 单元格详情弹窗，完整展示 BLOB / 长文本

### 💻 SQL 编辑器

- **Monaco Editor** — VS Code 同款编辑器引擎，语法高亮 + 智能补全
- **多标签页** — 同时编写多段 SQL，独立执行互不干扰
- **执行历史** — 自动记录每次执行，支持搜索回溯
- **结果展示** — 查询结果表格化展示，支持列排序

### 📤 数据导出

- **CSV** — 通用表格格式，Excel / Numbers 直接打开
- **JSON** — 结构化数据，适合程序处理
- **Excel** — 原生 `.xlsx` 格式，保留列类型信息

### ⚙️ 高度可定制

- **主题切换** — 亮色 / 暗色 / 跟随系统
- **编辑器偏好** — 字体族、字号、Tab 宽度、自动换行、迷你地图
- **快捷键自定义** — 12 个核心操作全部可自定义，冲突自动检测
- **多数据库管理** — 标签页式管理，同时打开多个数据库文件

---

## 🤖 AI 能力

> AI 功能支持 **11 个平台**，包括 OpenAI、DeepSeek、Claude、Gemini、通义千问等，也支持 Ollama 本地模型和任意 OpenAI 兼容端点。**你的数据不会被上传**，AI 仅接收 schema 元数据。

### 🗣️ 自然语言查询

用中文或英文描述你想要的数据，AI 自动生成 SQL：

```
"找出最近 7 天注册的用户，按注册时间倒序"
  ↓ AI 生成
SELECT * FROM users WHERE created_at > date('now', '-7 days') ORDER BY created_at DESC
```

### 💬 数据智能问答

像聊天一样提问数据问题，AI 自动生成 SQL → 执行 → 汇总结果：

```
你：这个月的订单总金额是多少？
AI：根据查询结果，本月共有 1,247 笔订单，总金额为 ¥328,456.78，日均订单 42 笔。
```

### ⚡ SQL 优化建议

AI 分析你的 SQL 性能瓶颈，提供优化方案：

- `EXPLAIN QUERY PLAN` 可视化
- 索引创建建议
- 查询重写方案
- 性能提升预估

### 🔧 错误自动修复

SQL 执行报错？AI 一键分析错误原因，给出修复后的 SQL。

### 🧠 表结构智能分析

选择任意表，AI 自动分析：

- 📋 表用途推测
- 📊 数据质量报告（空值率、唯一值、数据分布）
- 📈 索引优化建议
- ⚠️ 结构改进建议

### 支持的 AI 平台

| 平台 | 推荐模型 | 特点 |
|------|---------|------|
| 🟢 OpenAI | GPT-4o / GPT-4o-mini | 综合能力最强 |
| 🔵 DeepSeek | V3 / R1 | 性价比极高 |
| 🟣 Anthropic | Claude 3.5 Sonnet | 代码理解优秀 |
| 🔴 Google | Gemini 2.0 Flash | 速度快 |
| 🟠 通义千问 | Qwen-Plus | 中文优化 |
| 🌙 Moonshot | v1-32k | 长上下文 |
| 🔮 智谱 GLM | GLM-4-Plus | 国产首选 |
| 🦁 百川 | Baichuan4 | 中文理解 |
| ⭐ 零一万物 | yi-lightning | 快速响应 |
| 🦙 Ollama | 本地模型 | 完全离线 |
| 🔧 自定义 | 任意模型 | OpenAI 兼容 |

---

## 🚀 快速开始

### 下载安装

前往 [Releases](https://github.com/nicekate/sqlite-lens/releases) 下载最新版本：

- **Apple Silicon** (M1/M2/M3/M4) → `SQLite.Lens_x.x.x_aarch64.dmg`
- **Intel** → `SQLite.Lens_x.x.x_x64.dmg`

> 系统要求：macOS 11.0 (Big Sur) 或更高版本

### 使用方式

1. 打开 SQLite Lens
2. 点击「打开数据库」或直接拖拽 `.db` / `.sqlite` 文件到窗口
3. 开始浏览数据、编写 SQL、使用 AI 功能

### 配置 AI（可选）

1. 点击右上角 ⚙️ 设置按钮
2. 选择「AI 配置」标签页
3. 选择 AI 平台，填入 API Key
4. 点击「测试连接」确认可用
5. 开始享受 AI 赋能的数据操作体验

---

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────┐
│                   SQLite Lens                     │
├────────────────────┬─────────────────────────────┤
│   Frontend (Web)   │      Backend (Native)        │
│                    │                              │
│  React 19          │  Rust 2021 Edition           │
│  TypeScript 5.6    │  Tauri 2.x                   │
│  Zustand 5         │  rusqlite 0.32 (bundled)     │
│  TailwindCSS 4     │  reqwest + tokio (async AI)  │
│  Monaco Editor     │  rust_xlsxwriter (Excel)     │
│  TanStack Table    │  serde (serialization)       │
│  TanStack Virtual  │                              │
├────────────────────┴─────────────────────────────┤
│              Tauri 2.x IPC Bridge                 │
│         (28 commands, type-safe bindings)          │
├──────────────────────────────────────────────────┤
│           macOS (WebKit + Native APIs)            │
└──────────────────────────────────────────────────┘
```

### 为什么是 Tauri 而不是 Electron？

| | Tauri | Electron |
|--|:--:|:--:|
| 安装包大小 | **~15MB** | ~150MB+ |
| 内存占用 | **~50MB** | ~200MB+ |
| 启动速度 | **< 2s** | 3-5s |
| 安全性 | **Rust 内存安全** | Node.js |
| 数据库引擎 | **rusqlite (C 绑定)** | better-sqlite3 |

---

## 🛠 开发指南

### 环境准备

```bash
# 1. 安装 Xcode Command Line Tools
xcode-select --install

# 2. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 3. 安装 Tauri CLI
cargo install tauri-cli

# 4. 克隆仓库
git clone https://github.com/nicekate/sqlite-lens.git
cd sqlite-lens

# 5. 安装前端依赖
npm install

# 6. 启动开发模式 🚀
cargo tauri dev
```

### 常用命令

```bash
cargo tauri dev          # 开发模式（热更新）
cargo tauri build        # 构建发布包
npm run lint             # 代码检查
npm run typecheck        # 类型检查
npm run test             # 运行测试
```

### 项目结构

```
sqlite-lens/
├── src/                     # 前端 (React + TypeScript)
│   ├── features/            # 功能模块
│   │   ├── data-grid/       #   数据网格（虚拟滚动、编辑）
│   │   ├── sql-editor/      #   SQL 编辑器（Monaco、多标签）
│   │   ├── ai/              #   AI 功能（问答、优化、分析）
│   │   ├── settings/        #   设置（通用、编辑器、快捷键、AI）
│   │   └── export/          #   导出（CSV、JSON、Excel）
│   ├── stores/              # Zustand 状态管理
│   ├── services/            # Tauri IPC 调用封装
│   └── hooks/               # 自定义 Hooks
├── src-tauri/               # 后端 (Rust)
│   └── src/
│       ├── database/        #   SQLite 操作（连接、查询、Schema）
│       ├── ai/              #   AI 多平台适配（11 个预设）
│       ├── export/          #   导出引擎（CSV、JSON、Excel）
│       └── commands/        #   28 个 Tauri IPC 命令
└── .github/                 # CI/CD + Issue 模板
```

> 📖 详细开发文档请参阅 [SETUP.md](SETUP.md) 和 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🤝 参与贡献

我们欢迎任何形式的贡献！无论是：

- 🐛 **报告 Bug** — 使用 [Bug Report](https://github.com/nicekate/sqlite-lens/issues/new?template=bug_report.md) 模板
- 💡 **功能建议** — 使用 [Feature Request](https://github.com/nicekate/sqlite-lens/issues/new?template=feature_request.md) 模板
- 🔧 **提交代码** — 阅读 [贡献指南](CONTRIBUTING.md) 后提交 PR
- 📖 **完善文档** — 修正文档错误或补充说明
- ⭐ **Star 支持** — 最简单的支持方式！

> 详细贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📜 开源协议

[MIT License](LICENSE) © 2026 SQLite Lens Contributors

---

<div align="center">

**如果 SQLite Lens 对你有帮助，请给我们一个 ⭐ Star！**

这是对开源项目最好的支持 ❤️

[⬆ 回到顶部](#-sqlite-lens)

</div>
