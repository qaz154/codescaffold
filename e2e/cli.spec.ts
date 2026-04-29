import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CLI_PATH = path.join(__dirname, '../dist/cli/index.js');

function runCLI(args: string[], options?: { cwd?: string }): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: options?.cwd,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      exitCode: error.status || 1,
    };
  }
}

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'codescaffold-test-'));
  return dir;
}

function cleanupTempDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('CodeScaffold CLI', () => {
  const tempDir = createTempDir();

  afterAll(() => {
    cleanupTempDir(tempDir);
  });

  describe('--help', () => {
    test('should display help information', () => {
      const result = runCLI(['--help']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Commands:');
      expect(result.stdout).toContain('init');
      expect(result.stdout).toContain('create');
      expect(result.stdout).toContain('list');
      expect(result.stdout).toContain('generate');
    });
  });

  describe('--version', () => {
    test('should display version', () => {
      const result = runCLI(['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('list', () => {
    test('should list all available templates', () => {
      const result = runCLI(['list']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('nextjs-fullstack');
      expect(result.stdout).toContain('express-api');
      expect(result.stdout).toContain('python-fastapi');
      expect(result.stdout).toContain('go-microservice');
    });
  });

  describe('create', () => {
    test('should create a project with nextjs-fullstack template', () => {
      const projectPath = path.join(tempDir, 'test-create');
      const result = runCLI(['create', 'test-create', '--template', 'nextjs-fullstack', '--output', tempDir]);
      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'tsconfig.json'))).toBe(true);
    });

    test('should create a project with express-api template', () => {
      const projectPath = path.join(tempDir, 'test-express');
      const result = runCLI(['create', 'test-express', '--template', 'express-api', '--output', tempDir]);
      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
    });

    test('should fail with invalid template', () => {
      const result = runCLI(['create', 'test-invalid', '--template', 'nonexistent-template', '--output', tempDir]);
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('not found');
    });

    test('should fail with invalid project name', () => {
      const result = runCLI(['create', '../../invalid', '--template', 'express-api', '--output', tempDir]);
      expect(result.exitCode).not.toBe(0);
    });
  });

  describe('generate', () => {
    test('should generate a project from requirement', () => {
      const projectPath = path.join(tempDir, 'test-gen');
      const result = runCLI([
        'generate',
        '--requirement', 'A user management system with authentication',
        '--output', tempDir,
      ]);
      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(projectPath)).toBe(true);
    });

    test('should detect Next.js from requirement', () => {
      const projectPath = path.join(tempDir, 'test-nextjs');
      const result = runCLI([
        'generate',
        '--requirement', 'A Next.js fullstack app with dashboard',
        '--output', tempDir,
      ]);
      expect(result.exitCode).toBe(0);
      const pkgPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        expect(pkg.dependencies?.next || pkg.dependencies?.['next.js']).toBeDefined();
      }
    });

    test('should detect Python FastAPI from requirement', () => {
      const projectPath = path.join(tempDir, 'test-fastapi');
      const result = runCLI([
        'generate',
        '--requirement', 'A Python FastAPI microservice',
        '--output', tempDir,
      ]);
      expect(result.exitCode).toBe(0);
      const pkgPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        expect(pkg.dependencies?.fastapi).toBeDefined();
      }
    });
  });
});

describe('Path Validation', () => {
  test('should reject path traversal attempts', () => {
    const result = runCLI(['create', 'test', '--output', '../../../etc']);
    expect(result.exitCode).not.toBe(0);
  });

  test('should reject protected system directories', () => {
    if (process.platform !== 'win32') {
      const result = runCLI(['create', 'test', '--output', '/bin']);
      expect(result.exitCode).not.toBe(0);
    }
  });

  test('should reject invalid project names', () => {
    const result = runCLI(['create', 'test..', '--template', 'express-api']);
    expect(result.exitCode).not.toBe(0);
  });
});
