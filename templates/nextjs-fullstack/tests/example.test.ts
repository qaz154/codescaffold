import { describe, it, expect } from 'vitest';

describe('Example Tests', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const name = '{{PROJECT_NAME}}';
    expect(name).toBe('{{PROJECT_NAME}}');
  });
});
