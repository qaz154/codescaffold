import { describe, it, expect } from 'vitest';
import { detectKeyword, detectFirstKeyword } from './keyword';

describe('detectKeyword', () => {
  it('should detect keyword in text', () => {
    expect(detectKeyword('I need user authentication', ['auth', 'login'])).toBe(true);
    expect(detectKeyword('I need login functionality', ['auth', 'login'])).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(detectKeyword('I need AUTHENTICATION', ['auth'])).toBe(true);
    expect(detectKeyword('I need Authentication', ['auth'])).toBe(true);
    expect(detectKeyword('I need AUTH', ['auth'])).toBe(true);
  });

  it('should return false when no keyword found', () => {
    expect(detectKeyword('I need a simple website', ['auth', 'login'])).toBe(false);
  });

  it('should prefer longer patterns first', () => {
    const patterns = ['login', 'log', 'in'];
    const text = 'login';
    // Longer patterns should be checked first
    expect(detectKeyword(text, patterns)).toBe(true);
  });

  it('should handle empty patterns', () => {
    expect(detectKeyword('some text', [])).toBe(false);
  });

  it('should handle empty text', () => {
    expect(detectKeyword('', ['auth'])).toBe(false);
  });
});

describe('detectFirstKeyword', () => {
  it('should return value of first matching keyword', () => {
    const patterns: [string, string][] = [
      ['login', 'auth'],
      ['register', 'auth'],
      ['authenticate', 'auth'],
    ];
    expect(detectFirstKeyword('Please login', patterns)).toBe('auth');
  });

  it('should return null when no match', () => {
    const patterns: [string, number][] = [
      ['login', 1],
      ['register', 2],
    ];
    expect(detectFirstKeyword('Please logout', patterns)).toBeNull();
  });

  it('should prefer longer patterns', () => {
    const patterns: [string, string][] = [
      ['user management', 'management'],
      ['management', 'other'],
    ];
    expect(detectFirstKeyword('user management system', patterns)).toBe('management');
  });

  it('should work with different value types', () => {
    const patterns: [string, number][] = [
      ['express', 1],
      ['nextjs', 2],
    ];
    expect(detectFirstKeyword('I want an express API', patterns)).toBe(1);
    expect(detectFirstKeyword('I want nextjs app', patterns)).toBe(2);
  });
});
