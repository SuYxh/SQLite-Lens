# Contributing to SQLite Lens

Thank you for your interest in contributing to SQLite Lens! This guide will help you get started.

## Development Environment Setup

### Prerequisites

- **Node.js** >= 18.0
- **Rust** >= 1.70 (install via [rustup](https://rustup.rs/))
- **Xcode Command Line Tools** (macOS): `xcode-select --install`
- **Tauri CLI**: `cargo install tauri-cli`

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sqlite-lens.git
   cd sqlite-lens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   cargo tauri dev
   ```

## Branch Strategy

- `main` — Stable release branch
- `develop` — Development branch (base branch for PRs)
- `feature/*` — Feature branches
- `fix/*` — Bug fix branches
- `docs/*` — Documentation changes

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling changes |
| `ci` | CI/CD changes |

### Examples

```
feat(ai): add SQL optimization suggestions
fix(data-grid): fix cell editing in nullable columns
docs: update installation instructions
perf(query): add COUNT cache for large tables
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes with clear, atomic commits
3. Ensure your code passes lint and type checks:
   ```bash
   npm run lint
   npm run typecheck
   ```
4. Update documentation if needed
5. Open a PR against the `develop` branch
6. Fill in the PR template completely
7. Wait for code review

## Code Style

- **TypeScript**: Follow existing patterns, use strict typing
- **Rust**: Run `cargo clippy` and `cargo fmt`
- **Components**: Use named exports, follow existing file structure
- **CSS**: Use TailwindCSS v4 with CSS variables

## Reporting Issues

- Use the provided issue templates
- Include steps to reproduce
- Attach screenshots if applicable
- Specify your macOS version and architecture (Intel/Apple Silicon)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
