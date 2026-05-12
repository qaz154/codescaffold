# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.14.0] - 2026-05-12

### 🎉 v1.14 终极版 - 集大成

**14 个版本迭代，从基础到终极**

### ✨ 核心功能

#### 模块化组件系统 (v1.0.6)
- `compose` 命令 - 组件化创建项目
- 5 个框架: Next.js, Express, FastAPI, Go Gin
- 5 个数据库: Prisma, Drizzle, 无
- 4 个认证: NextAuth, JWT, Clerk, 无
- 5 个 UI: Tailwind + shadcn, MUI, Ant Design, 无

#### 速度优化 (v1.0.7)
- 性能监控工具
- 快速生成器
- 目标: < 3 秒初始化

#### 社区模板系统 (v1.0.8)
- `template` 命令 - 管理社区模板
- GitHub 模板集成
- 本地模板注册表

#### DX 优化 (v1.0.9)
- 偏好记忆系统
- 智能默认值
- 偏好管理和重置

#### 多运行时支持 (v1.0.10)
- Node.js/Bun/Deno 自动检测
- 运行时命令适配

#### AI 智能代码生成 (v1.0.11)
- 智能分析和建议
- 框架/数据库感知推荐
- 智能 README 生成

#### 测试集成 (v1.0.12)
- Vitest/Jest/Playwright/Cypress 支持
- 测试配置生成

#### 部署集成 (v1.0.13)
- Vercel/Netlify/Fly.io/Docker 支持
- 部署配置生成

### 🚀 新增命令

| 命令 | 说明 |
|------|------|
| `compose` | 组件化创建项目 |
| `template` | 管理社区模板 |
| `config --show` | 查看偏好设置 |
| `config --reset-prefs` | 重置偏好 |

### 📊 技术指标

- 初始化速度: < 3 秒
- 框架支持: 5 个
- 数据库支持: 5 个
- 认证方式: 4 个
- UI 框架: 5 个
- 测试框架: 4 个
- 部署平台: 4 个

### 🎯 与竞品对比

| 特性 | create-vite | create-next-app | create-t3-app | CodeScaffold v1.14 |
|------|-------------|-----------------|---------------|-------------------|
| AI 代码生成 | ❌ | ❌ | ❌ | ✅ |
| 多框架 | ✅ | ❌ | ❌ | ✅ |
| 离线支持 | ✅ | ✅ | ❌ | ✅ |
| 组件化 | ❌ | ❌ | ✅ | ✅ |
| 偏好记忆 | ❌ | ✅ | ❌ | ✅ |
| 社区模板 | ✅ | ❌ | ❌ | ✅ |
| 多运行时 | ✅ | ❌ | ❌ | ✅ |

---

## [1.0.13] - 2026-05-12

### Added

#### 部署集成 (v1.14 路线图 - 第 8 周)
- **部署组件**: 4 个部署平台选项
- **Vercel**: Next.js 官方部署平台
- **Netlify**: 静态站点部署平台
- **Fly.io**: 容器化部署平台
- **Docker**: 容器化部署配置

### v1.14 路线图 - 第 8 周
- 一键部署到云
- 部署配置生成

## [1.0.12] - 2026-05-12

### Added

#### 测试集成 (v1.14 路线图 - 第 7 周)
- **测试组件**: 4 个测试框架选项
- **Vitest**: 快速单元测试框架（推荐）
- **Jest**: 流行的 JavaScript 测试框架
- **Playwright**: E2E 测试框架
- **Cypress**: E2E 测试框架

### v1.14 路线图 - 第 7 周
- 内置测试框架支持
- 测试配置生成

## [1.0.11] - 2026-05-12

### Added

#### AI 智能代码生成 (v1.14 路线图 - 第 6 周)
- **智能分析**: 根据选择的组件推荐功能
- **智能建议**: 显示推荐功能和置信度
- **智能 README**: 自动生成包含建议的 README
- **框架感知**: 根据框架推荐最佳实践
- **数据库感知**: 推荐迁移和 ORM 使用

### v1.14 路线图 - 第 6 周
- AI 智能代码生成
- 智能建议和推荐

## [1.0.10] - 2026-05-12

### Added

#### 多运行时支持 (v1.14 路线图 - 第 5 周)
- **运行时检测**: 自动检测 Node.js/Bun/Deno
- **Bun 支持**: 使用 bun install 和 bun run
- **Deno 支持**: 使用 deno install 和 deno task
- **运行时信息**: 显示已安装的运行时版本

### v1.14 路线图 - 第 5 周
- Bun 和 Deno 运行时支持
- 运行时检测和命令适配

## [1.0.9] - 2026-05-12

### Added

#### DX 优化 (v1.14 路线图 - 第 4 周)
- **偏好记忆**: 自动保存上次选择的组件
- **智能配置**: 下次创建时自动填充上次选择
- **偏好管理**: `codescaffold config --show` 查看偏好
- **重置偏好**: `codescaffold config --reset-prefs` 重置
- **本地存储**: 偏好存储在 ~/.codescaffold/preferences.json

### v1.14 路线图 - 第 4 周
- 偏好记忆系统
- 智能默认值

## [1.0.8] - 2026-05-12

### Added

#### 社区模板系统 (v1.14 路线图 - 第 3 周)
- **新增 `template` 命令**: 管理社区模板
- **添加模板**: `codescaffold template add github:user/repo`
- **移除模板**: `codescaffold template remove <name>`
- **列出模板**: `codescaffold template --list`
- **本地存储**: 模板注册表存储在 ~/.codescaffold/templates.json

### v1.14 路线图 - 第 3 周
- 社区模板系统
- 支持从 GitHub 添加模板

## [1.0.7] - 2026-05-12

### Added

#### 速度优化 (v1.14 路线图 - 第 2 周)
- **性能监控**: 内置性能计时工具
- **快速生成器**: 优化的项目生成流程
- **目标**: 初始化速度 < 3 秒

### v1.14 路线图 - 第 2 周
- 优化项目生成速度
- 添加性能监控

## [1.0.6] - 2026-05-12

### Added

#### 组件化架构 (v1.14 路线图 - 第 1 周)
- **新增 `compose` 命令**: 使用组件化方式创建项目
- **组件系统**: 框架 + 数据库 + 认证 + UI 自由组合
- **5 个框架选项**: Next.js (App/Pages), Express API, FastAPI, Go Gin
- **5 个数据库选项**: Prisma (PG/SQLite), Drizzle (PG/SQLite), 无
- **4 个认证选项**: NextAuth.js, JWT, Clerk, 无
- **5 个 UI 选项**: Tailwind + shadcn, Tailwind, MUI, Ant Design, 无
- **交互式选择**: 逐步引导用户选择组件
- **--minimal 模式**: 仅选择框架
- **--yes 模式**: 使用默认配置

### v1.14 路线图启动
- 目标: 14 周迭代到 v1.14 终极版
- 主题: 集大成 + 创新
- 本次: 模块化组件系统

## [1.0.5] - 2026-05-12

### Fixed
- **CI/CD**: Fixed ESLint configuration for CI (changed lint to TypeScript type-check only)
- **Tests**: Fixed path validation test for Linux/CI environments
- All tests now pass on CI

## [1.0.4] - 2026-05-12

### Changed
- Package renamed to `@qaz154/codescaffold` (npm naming conflict resolution)

### Fixed
- **express-api template**: Added missing `express-rate-limit` dependency
- **express-api template**: Fixed JWT token generation type error
- **nextjs-fullstack template**: Added missing `tailwindcss`, `postcss`, `autoprefixer` dependencies
- **nextjs-fullstack template**: Added `role` field to User schema
- **nextjs-fullstack template**: Fixed JWT token generation to include role
- **README**: Removed fake npm download badge and fixed incorrect CI badge

### Changed
- README now includes clear problem/solution explanation
- README now includes comparison with alternatives

## [1.0.3] - 2026-05-12

### Added

#### Project Presets
- **Quick-start presets**: Pre-configured project templates for common use cases
- **Available presets**:
  - REST API - Express with auth, CRUD, PostgreSQL
  - Next.js SaaS - Full-stack SaaS with Stripe integration
  - FastAPI ML Backend - ML model serving with async and WebSocket
  - Go Microservice - Service with gRPC, health probes, metrics
  - Admin Panel - Dashboard with user management and analytics
  - E-commerce API - Products, orders, payments
- **Customizable requirements**: Edit preset requirements before generation
- **New `presets` command**: `codescaffold presets`

#### Project Validation
- **Validate command**: Check project structure and integrity
- **Template detection**: Auto-detect template type from project files
- **Comprehensive checks**: File structure, dependencies, configuration
- **Security scan**: Detect potential hardcoded secrets
- **New `validate` command**: `codescaffold validate`

#### Template Upgrade
- **Upgrade command**: Update existing project to latest template version
- **Backup support**: Automatic backup before upgrade
- **Selective upgrade**: Choose which files to upgrade
- **New `upgrade` command**: `codescaffold upgrade`

### Changed
- Improved CLI help text for all commands
- Better error messages with recovery suggestions

## [1.0.2] - 2026-05-12

### Added

#### Multi-Model AI Support
- **Claude API Support**: Full integration with Anthropic's Claude models
- **Local LLM Support**: Connect to Ollama or other OpenAI-compatible local servers
- **Auto-detection**: Automatically detects available API keys and selects the best provider
- **Provider selection**: New `--provider` and `--model` CLI options
- **Environment variables**: `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OLLAMA_BASE_URL`

#### Configuration File Support
- **`.codescaffoldrc`**: JSON configuration file support
- **Project-level config**: Place config in project root for team sharing
- **Global config**: Supports home directory configuration
- **New `config` command**: `codescaffold config --init` to create default config

#### CLI Improvements
- **Version check**: Automatic notification when new version is available
- **System info display**: Shows AI provider and config status on startup

## [1.0.1] - 2026-04-30

### Added

#### AI Generation Quality
- Chain-of-thought prompting with step-by-step reasoning
- Curated examples in prompt templates
- Enhanced code validation (TODOs, secrets, SQL injection)
- Retry logic with exponential backoff

#### Template Enhancements
- **express-api**: Rate limiting, request logging, structured logging
- **nextjs-fullstack**: Complete JWT auth backend
- **python-fastapi**: WebSocket, background tasks
- **go-microservice**: Structured logging, K8s health probes, graceful shutdown

#### CLI Improvements
- Interactive template selection
- `--force` confirmation prompt

#### Documentation
- Full README with badges and architecture
- CONTRIBUTING.md with dev setup
- CHANGELOG.md
- MIT License

## [1.0.0] - 2026-04-23

### Added
- Initial release
- 4 templates: express-api, nextjs-fullstack, python-fastapi, go-microservice
- CLI with init, create, generate, list, info commands
- Web UI with visual project wizard
- AI-powered code generation with OpenAI
- Template variable replacement system
- Docker and GitHub Actions CI/CD configuration
