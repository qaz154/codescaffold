# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-05-12

### Added

#### Multi-Model AI Support
- **Claude API Support**: Full integration with Anthropic's Claude models (claude-3-5-haiku, claude-3-5-sonnet)
- **Local LLM Support**: Connect to Ollama or other OpenAI-compatible local servers
- **Auto-detection**: Automatically detects available API keys and selects the best provider
- **Provider selection**: New `--provider` and `--model` CLI options
- **Environment variables**: `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OLLAMA_BASE_URL`

#### Configuration File Support
- **`.codescaffoldrc`**: JSON configuration file support
- **Project-level config**: Place config in project root for team sharing
- **Global config**: Supports home directory configuration
- **New `config` command**: `codescaffold config --init` to create default config
- **Configurable options**: provider, model, defaultTemplate, defaultOutput, template overrides

#### CLI Improvements
- **Version check**: Automatic notification when new version is available
- **System info display**: Shows AI provider and config status on startup
- **New `config` command**: Create and manage configuration files

### Changed
- Improved error messages with actionable suggestions
- Better user feedback during AI generation

### Fixed
- Handle missing API keys gracefully with clear instructions

## [1.0.1] - 2026-04-30

### Added

#### AI Generation Quality
- Chain-of-thought prompting with step-by-step reasoning in prompts
- Curated examples embedded in prompt templates for high-quality output
- Enhanced code validation rules:
  - Detects TODOs, FIXMEs, and incomplete code markers
  - Checks for hardcoded secrets and SQL injection patterns
  - Validates balanced braces, parentheses, and brackets
- Retry logic with exponential backoff for failed API calls

#### Template Enhancements
- **express-api**: Added rate limiting middleware, request ID tracing, structured logging
- **nextjs-fullstack**: Complete Express backend with JWT auth (register, login, profile)
- **python-fastapi**: WebSocket support, background task examples
- **go-microservice**: Structured logging, Kubernetes health probes, graceful shutdown

#### CLI Improvements
- Interactive template selection when `--template` not provided
- `--force` flag confirmation prompt

#### Testing
- Unit tests for error handling utilities
- Unit tests for path validation utilities
- Unit tests for keyword detection utilities

### Fixed
- Output parser regex now supports TypeScript, JavaScript, Python, Go code blocks
- `PathValidationError` now extends `ValidationError` for consistent error handling
- Function naming consistency (`analyzeRequirements` vs `analyzeRequirement`)
- Hardcoded credentials replaced with `CHANGE_ME` placeholders

## [1.0.0] - 2026-04-23

### Added
- Initial release
- 4 templates: express-api, nextjs-fullstack, python-fastapi, go-microservice
- CLI with init, create, generate, list, info commands
- Web UI with visual project wizard
- AI-powered code generation with OpenAI
- Template variable replacement system
- Docker and GitHub Actions CI/CD configuration
