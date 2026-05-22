import { describe, it, expect } from 'vitest';
import { listTemplates, validateTemplate } from './index.js';

describe('listTemplates', () => {
  it('should return array of template names', () => {
    const templates = listTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should include known templates', () => {
    const templates = listTemplates();
    expect(templates).toContain('nextjs-fullstack');
    expect(templates).toContain('express-api');
    expect(templates).toContain('python-fastapi');
    expect(templates).toContain('go-microservice');
  });
});

describe('validateTemplate', () => {
  it('should return true for valid template', async () => {
    const result = await validateTemplate('nextjs-fullstack');
    expect(result).toBe(true);
  });

  it('should return false for invalid template', async () => {
    const result = await validateTemplate('nonexistent-template');
    expect(result).toBe(false);
  });
});
