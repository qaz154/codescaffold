import { describe, it, expect } from 'vitest';
import {
  CLIError,
  ValidationError,
  TemplateError,
  GenerationError,
  formatError,
  ERROR_MESSAGES,
} from './errors';

describe('CLIError', () => {
  it('should create error with code and suggestion', () => {
    const error = new CLIError('Test error', 'TEST_CODE', 'Try this');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.suggestion).toBe('Try this');
    expect(error.name).toBe('CLIError');
  });

  it('should work without suggestion', () => {
    const error = new CLIError('Test error', 'TEST_CODE');
    expect(error.suggestion).toBeUndefined();
  });
});

describe('ValidationError', () => {
  it('should have VALIDATION_ERROR code', () => {
    const error = new ValidationError('Invalid input', 'Check the format');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
    expect(error.suggestion).toBe('Check the format');
  });
});

describe('TemplateError', () => {
  it('should have TEMPLATE_ERROR code', () => {
    const error = new TemplateError('Template not found', 'Use --list');
    expect(error.code).toBe('TEMPLATE_ERROR');
    expect(error.name).toBe('TemplateError');
  });
});

describe('GenerationError', () => {
  it('should have GENERATION_ERROR code', () => {
    const error = new GenerationError('Generation failed');
    expect(error.code).toBe('GENERATION_ERROR');
    expect(error.name).toBe('GenerationError');
  });
});

describe('formatError', () => {
  it('should format CLIError with code and suggestion', () => {
    const error = new ValidationError('Invalid input', 'Try this suggestion');
    const formatted = formatError(error);
    expect(formatted).toContain('Invalid input');
    expect(formatted).toContain('VALIDATION_ERROR');
    expect(formatted).toContain('Try this suggestion');
  });

  it('should format regular Error', () => {
    const error = new Error('Regular error');
    const formatted = formatError(error);
    expect(formatted).toContain('Regular error');
    expect(formatted).not.toContain('Error [');
  });

  it('should format unknown error', () => {
    const formatted = formatError('string error');
    expect(formatted).toContain('unexpected error');
  });
});

describe('ERROR_MESSAGES', () => {
  it('should have INVALID_PROJECT_NAME', () => {
    expect(ERROR_MESSAGES.INVALID_PROJECT_NAME.message).toBe('Invalid project name');
  });

  it('should have TEMPLATE_NOT_FOUND with function', () => {
    const result = ERROR_MESSAGES.TEMPLATE_NOT_FOUND('express-api');
    expect(result.message).toContain('express-api');
  });

  it('should have PATH_TRAVERSAL', () => {
    expect(ERROR_MESSAGES.PATH_TRAVERSAL.message).toContain('traversal');
  });

  it('should have PROTECTED_DIRECTORY', () => {
    expect(ERROR_MESSAGES.PROTECTED_DIRECTORY.message).toContain('protected');
  });

  it('should have DIRECTORY_EXISTS with function', () => {
    const result = ERROR_MESSAGES.DIRECTORY_EXISTS('my-project');
    expect(result.message).toContain('my-project');
  });

  it('should have OPENAI_NOT_CONFIGURED', () => {
    expect(ERROR_MESSAGES.OPENAI_NOT_CONFIGURED.message).toContain('API key');
  });
});
