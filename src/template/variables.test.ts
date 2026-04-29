import { describe, it, expect } from 'vitest';
import { replaceVariables, getDefaultVariables } from './variables';

describe('replaceVariables', () => {
  it('should replace PROJECT_NAME', () => {
    const variables = getDefaultVariables();
    const input = 'Project: {{PROJECT_NAME}}';
    const result = replaceVariables(input, variables);
    expect(result).toBe('Project: my-project');
  });

  it('should replace multiple variables', () => {
    const variables = getDefaultVariables();
    const input = '{{PROJECT_NAME}} by {{AUTHOR}} in {{YEAR}}';
    const result = replaceVariables(input, variables);
    expect(result).toBe('my-project by Developer in ' + new Date().getFullYear());
  });

  it('should leave unknown variables unchanged', () => {
    const variables = getDefaultVariables();
    const input = '{{UNKNOWN_VAR}}';
    const result = replaceVariables(input, variables);
    expect(result).toBe('{{UNKNOWN_VAR}}');
  });

  it('should replace DESCRIPTION', () => {
    const variables = { ...getDefaultVariables(), DESCRIPTION: 'Test description' };
    const input = '{{DESCRIPTION}}';
    const result = replaceVariables(input, variables);
    expect(result).toBe('Test description');
  });

  it('should replace DATABASE_URL', () => {
    const variables = { ...getDefaultVariables(), DATABASE_URL: 'mysql://localhost/test' };
    const input = 'URL: {{DATABASE_URL}}';
    const result = replaceVariables(input, variables);
    expect(result).toBe('URL: mysql://localhost/test');
  });
});

describe('getDefaultVariables', () => {
  it('should return all required variables', () => {
    const vars = getDefaultVariables();
    expect(vars.PROJECT_NAME).toBeDefined();
    expect(vars.DESCRIPTION).toBeDefined();
    expect(vars.AUTHOR).toBeDefined();
    expect(vars.YEAR).toBeDefined();
    expect(vars.DATABASE_URL).toBeDefined();
  });

  it('should have correct YEAR as current year', () => {
    const vars = getDefaultVariables();
    expect(vars.YEAR).toBe(new Date().getFullYear().toString());
  });
});
