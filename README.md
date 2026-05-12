# CodeScaffold

![npm version](https://img.shields.io/npm/v/codescaffold)
![npm downloads](https://img.shields.io/npm/dm/codescaffold)
![License](https://img.shields.io/npm/l/codescaffold)
![Build Status](https://img.shields.io/github/actions/workflow/status/qclaw/codescaffold/ci.yml)

**AI-Powered Full-Stack Project Scaffold Generator**

Generate production-ready project scaffolds in seconds. CodeScaffold takes your natural language requirements and automatically creates complete project structures with AI-generated custom code.

## Features

- **🎯 Project Presets**: Quick-start templates for common project types
- **🤖 Multi-Model AI Support**: OpenAI GPT, Anthropic Claude, and Local LLMs (Ollama)
- **📦 4 Production Templates**: Next.js, Express, Python FastAPI, Go Microservice
- **✅ Project Validation**: Validate project structure and security
- **⬆️ Template Upgrade**: Upgrade existing projects to latest template version
- **⚙️ Configuration File Support**: `.codescaffoldrc` for project-level settings
- **🔧 Interactive CLI**: Guided project creation with inquirer prompts
- **🌐 Web UI**: Visual project wizard with real-time analysis
- **🚀 Production Ready**: Docker, Docker Compose, GitHub Actions CI

## Quick Start

```bash
# Install
npm install -g codescaffold

# Interactive mode
codescaffold init

# Or use a preset for quick start
codescaffold presets

# Or use AI to generate custom code
codescaffold generate --requirement "User management API with roles and JWT auth"
```

## Presets

Quick-start with pre-configured project types:

```bash
codescaffold presets
```

Available presets:
- **REST API** - Express with auth, CRUD, PostgreSQL
- **Next.js SaaS** - Full-stack SaaS with Stripe integration
- **FastAPI ML Backend** - ML model serving with async and WebSocket
- **Go Microservice** - Service with gRPC, health probes, metrics
- **Admin Panel** - Dashboard with user management and analytics
- **E-commerce API** - Products, orders, payments

## AI Providers

CodeScaffold supports multiple AI providers with automatic detection:

| Provider | API Key Environment Variable | Default Model |
|----------|------------------------------|---------------|
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o-mini` |
| **Claude** | `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` | `claude-3-5-haiku-20241022` |
| **Local** | `OLLAMA_BASE_URL` | `llama3.1` |

### Provider Selection

```bash
# Use Claude
codescaffold generate --provider claude --requirement "..."

# Use specific model
codescaffold generate --provider openai --model gpt-4o --requirement "..."

# Use local LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434/v1 codescaffold generate --provider local --requirement "..."
```

## Configuration

Create a `.codescaffoldrc` file in your project or home directory:

```json
{
  "provider": "claude",
  "model": "claude-3-5-sonnet-20241022",
  "defaultTemplate": "express-api",
  "defaultOutput": ".",
  "templates": {
    "express-api": { "enabled": true },
    "nextjs-fullstack": { "enabled": true },
    "python-fastapi": { "enabled": true },
    "go-microservice": { "enabled": true }
  }
}
```

### Config Command

```bash
# Create default config in current directory
codescaffold config --init

# Show current configuration
codescaffold config --show
```

## Project Validation

Validate a CodeScaffold-generated project:

```bash
# Validate current directory
codescaffold validate

# Validate specific directory
codescaffold validate --directory ./my-project
```

Validation checks:
- Required template files
- Package/dependency configuration
- Dockerfile presence
- README and .gitignore
- Hardcoded secrets detection

## Template Upgrade

Upgrade an existing project to the latest template version:

```bash
# Upgrade current directory
codescaffold upgrade

# Upgrade specific directory
codescaffold upgrade --directory ./my-project

# Skip backup
codescaffold upgrade --no-backup
```

## Templates

| Template | Language | Best For | Key Features |
|----------|----------|----------|--------------|
| `express-api` | TypeScript | REST APIs | JWT Auth, RBAC, Rate Limiting, i18n (EN/ZH), Structured Logging |
| `nextjs-fullstack` | TypeScript | Full-Stack Apps | Next.js 15 App Router, Express Backend, Prisma |
| `python-fastapi` | Python | ML Backends | Auto OpenAPI Docs, Async, WebSocket Support, Background Tasks |
| `go-microservice` | Go | Cloud Services | Structured Logging, K8s Health Probes, Graceful Shutdown |

## Usage

### CLI Commands

```bash
# Interactive mode
codescaffold init

# Quick create
codescaffold create my-project --template express-api

# AI-powered generation with custom code
codescaffold generate --requirement "User management API with roles and JWT authentication"

# Quick-start presets
codescaffold presets

# Validate project
codescaffold validate

# Upgrade template
codescaffold upgrade

# List templates
codescaffold list

# Template info
codescaffold info express-api
```

### Web UI

```bash
codescaffold serve
# Open http://localhost:3000
```

### Options

| Option | Description |
|--------|-------------|
| `-t, --template <name>` | Template to use |
| `-o, --output <path>` | Output directory |
| `-f, --force` | Overwrite existing files |
| `-p, --port <number>` | Port for web UI |
| `--provider <provider>` | AI provider (openai, claude, local) |
| `--model <model>` | AI model to use |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude) |
| `CLAUDE_API_KEY` | Alternative env var for Claude |
| `OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434/v1`) |
| `DEBUG` | Enable debug logging |

## Architecture

```
codescaffold
├── src/
│   ├── commands/          # CLI command implementations
│   │   ├── presets.ts    # Project presets command
│   │   ├── validate.ts   # Project validation
│   │   └── upgrade.ts    # Template upgrade
│   ├── generator/         # Project generation orchestration
│   ├── ai/               # AI analysis and code generation
│   └── utils/
│       └── config.ts     # Configuration file support
├── templates/            # Project templates
│   ├── express-api/
│   ├── nextjs-fullstack/
│   ├── python-fastapi/
│   └── go-microservice/
└── web/                 # Web UI (optional)
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run CLI locally
npm run dev

# Link for global testing
npm link
```

## License

MIT

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
