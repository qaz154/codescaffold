import path from 'path';
import fs from 'fs';
import { ValidationError } from './errors';

export class PathValidationError extends ValidationError {
  constructor(message: string) {
    super(message, 'Use a valid path within your workspace');
  }
}

export function validateOutputPath(outputPath: string): string {
  // Resolve to absolute path
  const resolvedPath = path.resolve(outputPath);

  // Check for path traversal attempts
  if (outputPath.includes('..') || resolvedPath.includes('..')) {
    throw new PathValidationError('Path traversal is not allowed');
  }

  // Get current working directory
  const cwd = process.cwd();

  // Check if the path is within the current working directory or a subdirectory
  // This allows relative paths like './output' to work in any environment
  const normalizedPath = resolvedPath.toLowerCase().replace(/\\/g, '/');
  const normalizedCwd = cwd.toLowerCase().replace(/\\/g, '/');

  // Allow paths within current working directory
  if (normalizedPath.startsWith(normalizedCwd) || normalizedPath.startsWith(normalizedCwd + '/')) {
    return resolvedPath;
  }

  // Check for dangerous system paths (only block true system directories)
  const dangerousPaths = [
    '/',
    '/bin',
    '/etc',
    '/usr',
    '/var',
    '/sys',
    '/proc',
    '/dev',
    '/boot',
    '/lib',
    '/lib64',
    '/sbin',
    '/root',
    '/mnt',
    '/opt',
    '/srv',
  ];

  for (const dangerous of dangerousPaths) {
    if (normalizedPath === dangerous || normalizedPath.startsWith(dangerous + '/')) {
      throw new PathValidationError(`Cannot write to protected system directory: ${dangerous}`);
    }
  }

  // Check if path exists and is not empty (if it exists)
  if (fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      throw new PathValidationError(`Path exists but is not a directory: ${resolvedPath}`);
    }
  }

  return resolvedPath;
}

export function validateProjectName(name: string): void {
  // Check for empty or whitespace-only names
  if (!name || name.trim().length === 0) {
    throw new PathValidationError('Project name cannot be empty');
  }

  // Check for valid characters (alphanumeric, hyphen, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new PathValidationError(
      'Project name can only contain letters, numbers, hyphens, and underscores'
    );
  }

  // Check for leading/trailing hyphens or dots
  if (name.startsWith('-') || name.startsWith('.') || name.endsWith('-') || name.endsWith('.')) {
    throw new PathValidationError('Project name cannot start or end with hyphen or dot');
  }

  // Check length
  if (name.length > 214) {
    throw new PathValidationError('Project name cannot be longer than 214 characters');
  }

  // Reserved names
  const reserved = [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    '.github',
    '.env',
    'templates',
    'src',
    'tests',
  ];
  if (reserved.includes(name.toLowerCase())) {
    throw new PathValidationError(`Project name '${name}' is reserved. Please choose a different name.`);
  }
}

export function sanitizeFileName(fileName: string): string {
  // Remove or replace dangerous characters
  return fileName
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\0/g, '')
    .trim();
}
