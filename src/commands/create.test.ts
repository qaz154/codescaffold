import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTemplates } from '../generator';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

// Mock the generator
vi.mock('../template/generator', () => ({
  generateProject: vi.fn(),
}));

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    cyan: (text: string) => text,
    green: (text: string) => text,
    gray: (text: string) => text,
    bold: (text: string) => text,
    red: (text: string) => text,
  },
}));

// Mock ora
vi.mock('ora', () => ({
  default: () => ({
    start: () => ({ succeed: vi.fn(), fail: vi.fn() }),
  }),
}));

describe('create command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('template selection', () => {
    it('should list available templates', () => {
      const templates = listTemplates();
      expect(templates).toContain('express-api');
      expect(templates).toContain('nextjs-fullstack');
      expect(templates).toContain('python-fastapi');
      expect(templates).toContain('go-microservice');
    });
  });
});
