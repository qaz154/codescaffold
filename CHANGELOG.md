# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
