import { describe, it, expect } from 'vitest';
import {
  PathValidationError,
  validateOutputPath,
  validateProjectName,
  sanitizeFileName,
} from './path.js';
import { ValidationError } from './errors.js';

describe('PathValidationError', () => {
  it('should extend ValidationError', () => {
    const error = new PathValidationError('Invalid path');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe('Invalid path');
    expect(error.suggestion).toBeTruthy();
  });
});

describe('validateOutputPath', () => {
  it('should resolve relative paths', () => {
    const result = validateOutputPath('./output');
    expect(result).toContain('output');
  });

  it('should throw on path traversal', () => {
    expect(() => validateOutputPath('../etc/passwd')).toThrow(PathValidationError);
    expect(() => validateOutputPath('foo/../bar')).toThrow(PathValidationError);
  });

  it('should throw on path traversal attempts', () => {
    expect(() => validateOutputPath('../etc')).toThrow(PathValidationError);
    expect(() => validateOutputPath('foo/../bar')).toThrow(PathValidationError);
  });
});

describe('validateProjectName', () => {
  it('should accept valid project names', () => {
    expect(() => validateProjectName('my-project')).not.toThrow();
    expect(() => validateProjectName('my_project')).not.toThrow();
    expect(() => validateProjectName('MyProject123')).not.toThrow();
    expect(() => validateProjectName('a')).not.toThrow();
  });

  it('should reject empty names', () => {
    expect(() => validateProjectName('')).toThrow(PathValidationError);
    expect(() => validateProjectName('   ')).toThrow(PathValidationError);
  });

  it('should reject invalid characters', () => {
    expect(() => validateProjectName('my project')).toThrow();
    expect(() => validateProjectName('my@project')).toThrow();
    expect(() => validateProjectName('my/project')).toThrow();
  });

  it('should reject names starting/ending with hyphen or dot', () => {
    expect(() => validateProjectName('-myproject')).toThrow();
    expect(() => validateProjectName('myproject-')).toThrow();
    expect(() => validateProjectName('.myproject')).toThrow();
    expect(() => validateProjectName('myproject.')).toThrow();
  });

  it('should reject names longer than 214 characters', () => {
    const longName = 'a'.repeat(215);
    expect(() => validateProjectName(longName)).toThrow(PathValidationError);
  });
});

describe('sanitizeFileName', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeFileName('file<name>')).toBe('filename');
    expect(sanitizeFileName('file>name')).toBe('filename');
    expect(sanitizeFileName('file|name')).toBe('file|name');
    expect(sanitizeFileName('file*name')).toBe('filename');
    expect(sanitizeFileName('file?name')).toBe('filename');
  });

  it('should remove path traversal', () => {
    expect(sanitizeFileName('foo..bar')).toBe('foobar');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFileName('file\0name')).toBe('filename');
  });

  it('should trim whitespace', () => {
    expect(sanitizeFileName('  filename  ')).toBe('filename');
  });
});
