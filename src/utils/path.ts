import path from 'path';
import fs from 'fs';
import { ValidationError } from './errors';

export class PathValidationError extends ValidationError {
  constructor(message: string) {
    super(message, 'Use a valid path within your workspace');
  }
}

const PROTECTED_PREFIXES = [
  // Unix system paths
  '/etc', '/sys', '/proc', '/dev', '/boot', '/lib', '/lib64', '/sbin',
  '/root', '/mnt', '/opt', '/srv', '/run', '/var', '/usr',
  // Windows system paths (case-insensitive matching applied at runtime)
  'c:\\windows', 'c:\\program files', 'c:\\program files (x86)', 'c:\\programdata',
  'c:\\users\\default',
  // macOS
  '/system', '/library', '/applications',
];

function isProtectedPath(normalizedPath: string): boolean {
  const lower = normalizedPath.toLowerCase();
  for (const prefix of PROTECTED_PREFIXES) {
    const prefixLower = prefix.toLowerCase();
    if (lower === prefixLower || lower.startsWith(prefixLower + '/') || lower.startsWith(prefixLower + '\\')) {
      return true;
    }
  }
  return false;
}

export function validateOutputPath(outputPath: string): string {
  // Decode URL-encoded sequences (e.g., %2e%2e = ..)
  const decoded = decodeURIComponent(outputPath);

  // Check for path traversal in decoded input
  if (decoded.includes('..')) {
    throw new PathValidationError('Path traversal is not allowed');
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(decoded);

  // Normalize for cross-platform comparison
  const normalizedPath = resolvedPath.replace(/\\/g, '/').toLowerCase();

  // Check protected paths
  if (isProtectedPath(normalizedPath)) {
    throw new PathValidationError(`Cannot write to protected system directory`);
  }

  // Check if path exists and is a directory
  if (fs.existsSync(resolvedPath)) {
    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      throw new PathValidationError(`Path exists but is not a directory: ${resolvedPath}`);
    }
  }

  return resolvedPath;
}

export function validateProjectName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new PathValidationError('Project name cannot be empty');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new PathValidationError(
      'Project name can only contain letters, numbers, hyphens, and underscores'
    );
  }

  if (name.startsWith('-') || name.startsWith('.') || name.endsWith('-') || name.endsWith('.')) {
    throw new PathValidationError('Project name cannot start or end with hyphen or dot');
  }

  if (name.length > 214) {
    throw new PathValidationError('Project name cannot exceed 214 characters');
  }
}

const DANGEROUS_FILENAME_CHARS = /[<>"?*\x00-\x1f]/g;

export function sanitizeFileName(name: string): string {
  return name
    .replace(DANGEROUS_FILENAME_CHARS, '')
    .replace(/\.\./g, '')
    .trim();
}
