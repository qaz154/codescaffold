# Contributing to CodeScaffold

Thank you for your interest in contributing to CodeScaffold!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Link for local testing: `npm link`
5. Run tests: `npm test`

## Project Structure

```
codescaffold/
├── src/
│   ├── commands/          # CLI command implementations
│   ├── generator/         # Project generation orchestration
│   ├── ai/               # AI analysis and code generation
│   │   ├── analyzer.ts  # Requirement analysis
│   │   ├── code-generator.ts # AI code generation with prompts
│   │   ├── prompts/     # Prompt templates with examples
│   │   └── file-mapper.ts # Feature-to-file mapping
│   ├── template/        # Template management
│   └── utils/           # Utilities (errors, path, etc.)
├── templates/            # Project templates
│   ├── express-api/     # Express.js TypeScript API
│   ├── nextjs-fullstack/ # Next.js 15 + Express
│   ├── python-fastapi/  # Python FastAPI
│   └── go-microservice/ # Go Gin Microservice
└── web/                 # Web UI (optional)
```

## Adding a New Template

1. Create a new directory under `templates/`
2. Follow the structure of existing templates
3. Add template metadata to `src/config/features.json`
4. Update `src/commands/info.ts` with template information
5. Add AI prompts in `src/ai/prompts/index.ts` if needed

## Adding a New CLI Command

1. Create a new file in `src/commands/`
2. Implement the command function
3. Register the command in `src/cli/index.ts`

## Code Style

- Use TypeScript with strict mode
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Write unit tests for new functionality

## Commit Messages

Format: `<type>: <description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Example:
```
feat: add WebSocket support to python-fastapi template
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/ai/analyzer.test.ts
```

## Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with a clear message
6. Push and create a PR

## Issues

Report bugs and feature requests via GitHub Issues.

For bugs, include:
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
