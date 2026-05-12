<div align="center">

# CodeScaffold

### AI-Powered Full-Stack Project Scaffold Generator

[![npm version](https://img.shields.io/npm/v/@qaz154/codescaffold?style=flat-square)](https://www.npmjs.com/package/@qaz154/codescaffold)
[![License](https://img.shields.io/npm/l/@qaz154/codescaffold?style=flat-square)](https://github.com/qaz154/codescaffold/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/qaz154/codescaffold/ci.yml?style=flat-square)](https://github.com/qaz154/codescaffold/actions)
[![Tests](https://img.shields.io/badge/tests-108%20passed-brightgreen?style=flat-square)](https://github.com/qaz154/codescaffold)

Generate production-ready project scaffolds in seconds with AI assistance.

[Quick Start](#quick-start) · [Features](#features) · [Templates](#templates) · [CLI](#cli-commands) · [Philosophy](#philosophy)

</div>

---

## What Problem Does This Solve?

| Who | Pain Point | CodeScaffold Solution |
|-----|------------|----------------------|
| **Independent Developers** | Spending 1-2 days setting up project structure | Generate complete project in 30 seconds |
| **Learners** | Don't know best practices | Templates include Auth, RBAC, logging, Docker |
| **Startups** | Need to validate MVP quickly | Describe requirements → Complete backend |
| **Teams** | Inconsistent project structures | Standardized, customizable components |

## Why CodeScaffold?

| Feature | create-vite | create-next-app | create-t3-app | **CodeScaffold** |
|---------|-------------|-----------------|---------------|------------------|
| AI Code Generation | ❌ | ❌ | ❌ | ✅ |
| Multiple Frameworks | ✅ | ❌ | ❌ | ✅ |
| Component System | ❌ | ❌ | ✅ | ✅ |
| Compatibility Check | ❌ | ❌ | ❌ | ✅ |
| Real-time Preview | ❌ | ❌ | ❌ | ✅ |
| Quality Gate | ❌ | ❌ | ❌ | ✅ |
| Project Migration | ❌ | ❌ | ❌ | ✅ |
| One-click Deploy | ❌ | ❌ | ❌ | ✅ |

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Modular Components** | Framework + Database + Auth + UI自由组合 |
| **Smart Dependencies** | 自动检测不兼容的组件组合 |
| **Compatibility Check** | 防止选择不兼容的组合 |
| **Real-time Preview** | 选择组件时显示项目结构 |
| **AI Recommendations** | 根据框架推荐最佳组件 |
| **Quality Gate** | 生成后自动检查代码质量 |

### AI-Powered

| Feature | Description |
|---------|-------------|
| **Multi-Model Support** | OpenAI, Claude, Local LLMs (Ollama) |
| **Smart Code Generation** | AI生成业务代码，不只是模板复制 |
| **Chain-of-Thought** | 结构化代码生成，质量更高 |

### Developer Experience

| Feature | Description |
|---------|-------------|
| **Preference Memory** | 记住上次选择，下次自动填充 |
| **Zero Config Mode** | `--defaults` 一键创建 |
| **Offline Support** | 本地缓存，离线也能用 |
| **Package Manager** | npm/yarn/pnpm/bun 自动检测 |

---

## Quick Start

```bash
# Install globally
npm install -g @qaz154/codescaffold

# Zero config mode (recommended for quick start)
codescaffold compose --defaults

# Interactive mode
codescaffold compose

# AI-powered generation
codescaffold generate --requirement "User management API with roles and JWT auth"
```

---

## Templates

| Template | Language | Best For | Key Features |
|----------|----------|----------|--------------|
| `express-api` | TypeScript | REST APIs | JWT Auth, RBAC, Rate Limiting, i18n |
| `nextjs-fullstack` | TypeScript | Full-Stack Apps | Next.js 15 App Router, Prisma, Tailwind |
| `python-fastapi` | Python | ML Backends | Async, WebSocket, OpenAPI Docs |
| `go-microservice` | Go | Cloud Services | Structured Logging, K8s Probes |

---

## CLI Commands

### Project Creation

```bash
# Zero config mode
codescaffold compose --defaults

# Interactive mode
codescaffold compose

# Minimal mode (framework only)
codescaffold compose --minimal

# Empty mode (no DB, Auth, UI)
codescaffold compose --empty

# Current directory
codescaffold compose --current-dir

# Skip confirmation
codescaffold compose --yes
```

### Template Management

```bash
# List templates
codescaffold list

# Template info
codescaffold info express-api

# Add community template
codescaffold template add github:user/repo

# Search templates
codescaffold template --search "react admin"
```

### Project Management

```bash
# Validate project
codescaffold validate

# Upgrade project
codescaffold upgrade

# Migrate project
codescaffold migrate --source ./old-project
```

### Configuration

```bash
# Show config
codescaffold config --show

# Reset preferences
codescaffold config --reset-prefs

# Clear cache
codescaffold config --clear-cache
```

---

## AI Providers

| Provider | Environment Variable | Default Model |
|----------|---------------------|---------------|
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o-mini` |
| **Claude** | `ANTHROPIC_API_KEY` | `claude-3-5-haiku-20241022` |
| **Local** | `OLLAMA_BASE_URL` | `llama3.1` |

```bash
# Use Claude
codescaffold generate --provider claude --requirement "..."

# Use local LLM
OLLAMA_BASE_URL=http://localhost:11434/v1 codescaffold generate --provider local --requirement "..."
```

---

## Configuration

Create `.codescaffoldrc` in your project root:

```json
{
  "provider": "claude",
  "model": "claude-3-5-sonnet-20241022",
  "defaultTemplate": "express-api"
}
```

---

## Philosophy

### Core Principles

1. **AI is Optional, Not Required**
   - Core value is the component system
   - AI is an enhancement, not a dependency
   - Works offline with local cache

2. **Components Over Templates**
   - Framework + DB + Auth + UI = Complete Project
   - Each component is independent and replaceable
   - Dependency resolution and compatibility checking

3. **Safety First**
   - Path traversal validation (Windows + Unix)
   - GitHub source validation
   - Component compatibility checking
   - Code quality gate

4. **Developer Experience**
   - Zero config startup
   - Preference memory
   - Real-time preview
   - Smart recommendations

5. **No Bloat**
   - Only include necessary dependencies
   - Add components on demand
   - Minimal and empty modes

---

## Development

```bash
# Clone
git clone https://github.com/qaz154/codescaffold.git
cd codescaffold

# Install
npm install

# Build
npm run build

# Test
npm run test:run

# Dev
npm run dev
```

---

## License

MIT

---

<div align="center">

**Built with ❤️ by [QAZ154](https://github.com/qaz154)**

[Report Bug](https://github.com/qaz154/codescaffold/issues) · [Request Feature](https://github.com/qaz154/codescaffold/issues)

</div>
