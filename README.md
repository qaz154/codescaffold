# CodeScaffold

![npm version](https://img.shields.io/npm/v/codescaffold)
![License](https://img.shields.io/npm/l/codescaffold)

**AI-Powered Full-Stack Project Scaffold Generator**

Generate production-ready project scaffolds in seconds. CodeScaffold takes your natural language requirements and automatically creates complete project structures with AI-generated custom code.

## What Problem Does This Solve?

| Who | Pain Point | Solution |
|-----|------------|----------|
| **Independent Developers** | Spending 1-2 days setting up project structure | Generate complete project in 30 seconds |
| **Learners** | Don't know best practices | Templates include Auth, RBAC, logging, Docker |
| **Startups** | Need to validate MVP quickly | Describe requirements → Complete backend |
| **AI Developers** | Need to test with local LLMs | Built-in Ollama support |

## Comparison with Alternatives

| Feature | create-next-app | CodeScaffold |
|---------|-----------------|--------------|
| Generation | Fixed template | AI + Template |
| Custom code | ❌ Scaffold only | ✅ AI-generated business code |
| Multiple stacks | ❌ One framework | ✅ Express/Next/FastAPI/Go |
| Best practices | ❌ Basic structure | ✅ Auth/RBAC/Docker/CI |
| Multi-model AI | ❌ | ✅ OpenAI/Claude/Ollama |

## Features

- **🎯 Project Presets**: Quick-start templates for common project types
- **🤖 Multi-Model AI Support**: OpenAI GPT, Anthropic Claude, and Local LLMs (Ollama)
- **📦 4 Production Templates**: Next.js, Express, Python FastAPI, Go Microservice
- **✅ Project Validation**: Validate project structure and security
- **⬆️ Template Upgrade**: Upgrade existing projects to latest template version
- **⚙️ Configuration File Support**: `.codescaffoldrc` for project-level settings

## Quick Start

```bash
# Install globally
npm install -g codescaffold

# Quick start with preset
codescaffold presets

# Interactive mode
codescaffold init

# Or describe what you need
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

## Templates

| Template | Language | Best For | Key Features |
|----------|----------|----------|--------------|
| `express-api` | TypeScript | REST APIs | JWT Auth, RBAC, Rate Limiting, i18n (EN/ZH), Structured Logging |
| `nextjs-fullstack` | TypeScript | Full-Stack Apps | Next.js 15 App Router, Express Backend, Prisma |
| `python-fastapi` | Python | ML Backends | Auto OpenAPI Docs, Async, WebSocket Support, Background Tasks |
| `go-microservice` | Go | Cloud Services | Structured Logging, K8s Health Probes, Graceful Shutdown |

## CLI Commands

```bash
# Quick start with presets
codescaffold presets

# Interactive project creation
codescaffold init

# Quick create from template
codescaffold create my-project --template express-api

# AI-powered generation
codescaffold generate --requirement "User management API with JWT auth"

# Validate project structure
codescaffold validate

# Upgrade project to latest template
codescaffold upgrade

# List available templates
codescaffold list

# Show template details
codescaffold info express-api
```

## Configuration

Create a `.codescaffoldrc` file in your project or home directory:

```json
{
  "provider": "claude",
  "model": "claude-3-5-sonnet-20241022",
  "defaultTemplate": "express-api"
}
```

## Project Validation

```bash
codescaffold validate
```

Checks:
- Required template files
- Package/dependency configuration
- Dockerfile presence
- README and .gitignore
- Hardcoded secrets detection

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude) |
| `OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434/v1`) |
| `DEBUG` | Enable debug logging |

## Development

```bash
# Clone the repo
git clone https://github.com/qaz154/codescaffold.git
cd codescaffold

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm run dev

# Link for global testing
npm link
```

## License

MIT

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
