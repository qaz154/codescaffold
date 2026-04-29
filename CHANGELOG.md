# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
