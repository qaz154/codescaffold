import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// We test the exported functions from validate.ts indirectly via a generated project
import { generateProject } from '../template/generator.js';

describe('validate integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should generate a project that passes structure checks', async () => {
    const projectPath = await generateProject({
      name: 'test-validate',
      description: 'Test project for validation',
      author: 'Test',
      template: 'express-api',
      output: tempDir,
      force: true,
      useAi: false,
    });

    // Verify key files exist
    expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'src'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
  });

  it('should generate nextjs template with correct structure', async () => {
    const projectPath = await generateProject({
      name: 'test-next',
      description: 'Test Next.js project',
      author: 'Test',
      template: 'nextjs-fullstack',
      output: tempDir,
      force: true,
      useAi: false,
    });

    expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'next.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'app'))).toBe(true);
  });

  it('should generate python template with correct structure', async () => {
    const projectPath = await generateProject({
      name: 'test-python',
      description: 'Test Python project',
      author: 'Test',
      template: 'python-fastapi',
      output: tempDir,
      force: true,
      useAi: false,
    });

    expect(fs.existsSync(path.join(projectPath, 'pyproject.toml'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'app'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'tests'))).toBe(true);
  });

  it('should generate go template with correct structure', async () => {
    const projectPath = await generateProject({
      name: 'test-go',
      description: 'Test Go project',
      author: 'Test',
      template: 'go-microservice',
      output: tempDir,
      force: true,
      useAi: false,
    });

    expect(fs.existsSync(path.join(projectPath, 'go.mod'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'cmd'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'internal'))).toBe(true);
  });
});
