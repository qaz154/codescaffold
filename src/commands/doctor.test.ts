import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateProject } from '../template/generator.js';

describe('doctor integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'doctor-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect a healthy generated project', async () => {
    const projectPath = await generateProject({
      name: 'healthy-project',
      description: 'A healthy project',
      author: 'Test',
      template: 'express-api',
      output: tempDir,
      force: true,
      useAi: false,
    });

    // Key files should exist
    expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);

    // package.json should be valid JSON
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe('healthy-project');
    expect(pkg.version).toBe('1.0.0');
  });

  it('should detect invalid package.json', () => {
    const projectPath = path.join(tempDir, 'bad-pkg');
    fs.mkdirSync(projectPath, { recursive: true });
    fs.writeFileSync(path.join(projectPath, 'package.json'), 'not json');

    expect(() => {
      JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
    }).toThrow();
  });

  it('should detect missing .gitignore', () => {
    const projectPath = path.join(tempDir, 'no-gitignore');
    fs.mkdirSync(projectPath, { recursive: true });
    fs.writeFileSync(path.join(projectPath, 'package.json'), '{}');

    expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(false);
  });

  it('should detect .env not in .gitignore', () => {
    const projectPath = path.join(tempDir, 'env-leak');
    fs.mkdirSync(projectPath, { recursive: true });
    fs.writeFileSync(path.join(projectPath, '.env'), 'SECRET=abc123');
    fs.writeFileSync(path.join(projectPath, '.gitignore'), 'node_modules/\n');

    const gitignore = fs.readFileSync(path.join(projectPath, '.gitignore'), 'utf-8');
    expect(gitignore.includes('.env')).toBe(false);
  });

  it('should detect hardcoded secrets', () => {
    const srcDir = path.join(tempDir, 'secrets', 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'config.ts'),
      'const apiKey = "sk-abcdef1234567890abcdef1234567890";'
    );

    const content = fs.readFileSync(path.join(srcDir, 'config.ts'), 'utf-8');
    const secretPattern = /(?:sk-|pk-)[a-zA-Z0-9]{20,}/;
    expect(secretPattern.test(content)).toBe(true);
  });
});
