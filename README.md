# CodeScaffold

![npm version](https://img.shields.io/npm/v/codescaffold)
![npm downloads](https://img.shields.io/npm/dm/codescaffold)
![License](https://img.shields.io/npm/l/codescaffold)
![Build Status](https://img.shields.io/github/actions/workflow/status/qclaw/codescaffold/ci.yml)

**AI-Powered Full-Stack Project Scaffold Generator**

Generate production-ready project scaffolds in seconds. CodeScaffold takes your natural language requirements and automatically creates complete project structures with AI-generated custom code.

## Features

- **4 Production Templates**: Next.js, Express, Python FastAPI, Go Microservice
- **AI Code Generation**: LLM-powered custom code generation (not just template copying)
- **Chain-of-Thought Prompting**: High-quality, structured code generation with validation
- **Template Quality**: Every template includes auth, i18n, tests, and production middleware
- **Interactive CLI**: Guided project creation with inquirer prompts
- **Web UI**: Visual project wizard with real-time analysis
- **Production Ready**: Docker, Docker Compose, GitHub Actions CI

## Quick Start

```bash
# Install
npm install -g codescaffold

# Interactive mode
codescaffold init

# Or use AI to generate custom code
codescaffold generate --requirement "User management API with roles and JWT auth"
```

## Templates

| Template | Language | Best For | Key Features |
|----------|----------|----------|--------------|
| `express-api` | TypeScript | REST APIs | JWT Auth, RBAC, Rate Limiting, i18n (EN/ZH), Structured Logging |
| `nextjs-fullstack` | TypeScript | Full-Stack Apps | Next.js 15 App Router, Express Backend, Prisma |
| `python-fastapi` | Python | ML Backends | Auto OpenAPI Docs, Async, WebSocket Support, Background Tasks |
| `go-microservice` | Go | Cloud Services | Structured Logging, K8s Health Probes, Graceful Shutdown |

## Usage

### CLI

```bash
# Interactive mode
codescaffold init

# Quick create
codescaffold create my-project --template express-api

# AI-powered generation with custom code
codescaffold generate --requirement "User management API with roles and JWT authentication"

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

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI-powered code generation |
| `DEBUG` | Enable debug logging |

## Architecture

```
codescaffold
├── src/
│   ├── commands/          # CLI command implementations
│   ├── generator/         # Project generation orchestration
│   ├── ai/               # AI analysis and code generation
│   │   ├── analyzer.ts  # Requirement analysis
│   │   ├── code-generator.ts # AI code generation
│   │   ├── prompts/     # Prompt templates with examples
│   │   └── file-mapper.ts # Feature-to-file mapping
│   └── template/        # Template management
├── templates/            # Project templates
│   ├── express-api/     # Express.js TypeScript API
│   ├── nextjs-fullstack/ # Next.js 15 + Express
│   ├── python-fastapi/  # Python FastAPI
│   └── go-microservice/ # Go Gin Microservice
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
