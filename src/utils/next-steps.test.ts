import { describe, it, expect } from 'vitest';
import { getTemplateNextSteps } from './next-steps.js';

describe('getTemplateNextSteps', () => {
  it('should return npm steps for nextjs-fullstack', () => {
    const steps = getTemplateNextSteps('nextjs-fullstack');
    expect(steps).toContain('npm install');
    expect(steps).toContain('npm run dev');
  });

  it('should return npm steps for express-api', () => {
    const steps = getTemplateNextSteps('express-api');
    expect(steps).toContain('npm install');
    expect(steps).toContain('npm run dev');
  });

  it('should return python steps for python-fastapi', () => {
    const steps = getTemplateNextSteps('python-fastapi');
    expect(steps).toContain('python -m venv venv');
    expect(steps).toContain('pip install -e ".[dev]"');
    expect(steps).toContain('uvicorn app.main:app --reload');
  });

  it('should return go steps for go-microservice', () => {
    const steps = getTemplateNextSteps('go-microservice');
    expect(steps).toContain('go mod tidy');
    expect(steps).toContain('go run cmd/server/main.go');
  });

  it('should fall back to npm for unknown template', () => {
    const steps = getTemplateNextSteps('unknown-template');
    expect(steps).toContain('npm install');
    expect(steps).toContain('npm run dev');
  });

  it('should return non-empty arrays for all known templates', () => {
    for (const template of ['nextjs-fullstack', 'express-api', 'python-fastapi', 'go-microservice']) {
      const steps = getTemplateNextSteps(template);
      expect(steps.length).toBeGreaterThan(0);
    }
  });
});
