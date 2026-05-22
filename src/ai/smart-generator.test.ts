import { describe, it, expect } from 'vitest';
import { analyzeConfig } from './smart-generator.js';
import { ProjectConfig, frameworks, databases, auth } from '../components/index.js';

describe('Smart Generator', () => {
  it('should suggest App Router for Next.js', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      framework: frameworks.options.find(opt => opt.id === 'nextjs-app')!,
      database: null,
      auth: null,
      ui: null,
      features: [],
    };

    const suggestions = analyzeConfig(config);
    expect(suggestions.some(s => s.feature === 'App Router')).toBe(true);
  });

  it('should suggest Server Components for Next.js', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      framework: frameworks.options.find(opt => opt.id === 'nextjs-app')!,
      database: null,
      auth: null,
      ui: null,
      features: [],
    };

    const suggestions = analyzeConfig(config);
    expect(suggestions.some(s => s.feature === 'Server Components')).toBe(true);
  });

  it('should suggest Prisma Migrate when database is Prisma', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      framework: frameworks.options.find(opt => opt.id === 'express-api')!,
      database: databases.options.find(opt => opt.id === 'prisma-pg')!,
      auth: null,
      ui: null,
      features: [],
    };

    const suggestions = analyzeConfig(config);
    expect(suggestions.some(s => s.feature === 'Prisma Migrate')).toBe(true);
  });

  it('should suggest NextAuth Providers when auth is NextAuth', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      framework: frameworks.options.find(opt => opt.id === 'nextjs-app')!,
      database: null,
      auth: auth.options.find(opt => opt.id === 'nextauth')!,
      ui: null,
      features: [],
    };

    const suggestions = analyzeConfig(config);
    expect(suggestions.some(s => s.feature === 'NextAuth Providers')).toBe(true);
  });

  it('should return empty suggestions for minimal config', () => {
    const config: ProjectConfig = {
      name: 'test-project',
      framework: frameworks.options.find(opt => opt.id === 'express-api')!,
      database: null,
      auth: null,
      ui: null,
      features: [],
    };

    const suggestions = analyzeConfig(config);
    expect(suggestions.length).toBe(0);
  });
});
