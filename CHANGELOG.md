# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-05-12

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
