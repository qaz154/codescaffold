# Contributing to CodeScaffold

Thank you for your interest in contributing to CodeScaffold!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run tests: `npm run test:run`
5. Run linter: `npx eslint src/`
6. Format code: `npm run format`

## Testing

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:run -- --coverage

# Run specific test file
npm run test:run -- src/ai/analyzer.test.ts

# Run E2E tests (requires build first)
npm run build && npm run test:e2e
```
