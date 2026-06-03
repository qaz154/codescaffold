import { describe, it, expect } from 'vitest';
import {
  detectLanguageFromPath,
  parseLLMResponse,
  validateGeneratedCode,
} from './output-parser.js';

describe('detectLanguageFromPath', () => {
  it('should detect typescript from .ts', () => {
    expect(detectLanguageFromPath('src/index.ts')).toBe('typescript');
  });

  it('should detect typescript from .tsx', () => {
    expect(detectLanguageFromPath('app/page.tsx')).toBe('typescript');
  });

  it('should detect javascript from .js', () => {
    expect(detectLanguageFromPath('src/index.js')).toBe('javascript');
  });

  it('should detect python from .py', () => {
    expect(detectLanguageFromPath('app/main.py')).toBe('python');
  });

  it('should detect go from .go', () => {
    expect(detectLanguageFromPath('cmd/server/main.go')).toBe('go');
  });

  it('should detect prisma from .prisma', () => {
    expect(detectLanguageFromPath('prisma/schema.prisma')).toBe('prisma');
  });

  it('should detect yaml from .yml', () => {
    expect(detectLanguageFromPath('docker-compose.yml')).toBe('yaml');
  });

  it('should detect yaml from .yaml', () => {
    expect(detectLanguageFromPath('config.yaml')).toBe('yaml');
  });

  it('should detect json from .json', () => {
    expect(detectLanguageFromPath('package.json')).toBe('json');
  });

  it('should default to typescript for unknown extension', () => {
    expect(detectLanguageFromPath('src/index.unknown')).toBe('typescript');
  });
});

describe('parseLLMResponse', () => {
  it('should parse valid JSON response', () => {
    const input = JSON.stringify({
      files: [{ path: 'src/index.ts', content: 'export const x = 1;' }],
    });
    const result = parseLLMResponse(input);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe('src/index.ts');
    expect(result.files[0].language).toBe('typescript');
  });

  it('should parse response wrapped in markdown code block', () => {
    const input =
      '```json\n' +
      JSON.stringify({
        files: [{ path: 'app.py', content: 'print("hello")' }],
      }) +
      '\n```';
    const result = parseLLMResponse(input);
    expect(result.files).toHaveLength(1);
    expect(result.files[0].language).toBe('python');
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseLLMResponse('not json')).toThrow('Failed to parse');
  });

  it('should throw on missing files array', () => {
    expect(() => parseLLMResponse('{}')).toThrow('Invalid LLM response');
  });

  it('should throw on empty file path', () => {
    const input = JSON.stringify({
      files: [{ path: '', content: 'code' }],
    });
    expect(() => parseLLMResponse(input)).toThrow();
  });

  it('should auto-detect language when not provided', () => {
    const input = JSON.stringify({
      files: [{ path: 'main.go', content: 'package main' }],
    });
    const result = parseLLMResponse(input);
    expect(result.files[0].language).toBe('go');
  });
});

describe('validateGeneratedCode', () => {
  it('should detect TODO in code', () => {
    const errors = validateGeneratedCode('const x = 1; // TODO: fix', 'typescript');
    expect(errors.some(e => e.includes('TODO'))).toBe(true);
  });

  it('should detect FIXME in code', () => {
    const errors = validateGeneratedCode('// FIXME: broken', 'typescript');
    expect(errors.some(e => e.includes('FIXME'))).toBe(true);
  });

  it('should detect console.log', () => {
    const errors = validateGeneratedCode('console.log("debug")', 'typescript');
    expect(errors.some(e => e.includes('console.log'))).toBe(true);
  });

  it('should detect hardcoded password', () => {
    const errors = validateGeneratedCode('password = "secret123"', 'typescript');
    expect(errors.some(e => e.includes('hardcoded password'))).toBe(true);
  });

  it('should not flag clean code', () => {
    const code = `import express from 'express';\nexport const app = express();`;
    const errors = validateGeneratedCode(code, 'typescript');
    expect(errors).toHaveLength(0);
  });
});
