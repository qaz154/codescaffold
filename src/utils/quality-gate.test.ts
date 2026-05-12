import { describe, it, expect } from 'vitest';
import { runQualityChecks } from './quality-gate';
import path from 'path';

describe('Quality Gate', () => {
  it('should detect missing package.json', () => {
    const result = runQualityChecks('/tmp');
    const pkgCheck = result.checks.find((c) => c.name === 'package.json');
    expect(pkgCheck?.passed).toBe(false);
  });

  it('should detect missing README', () => {
    const result = runQualityChecks('/tmp');
    const readmeCheck = result.checks.find((c) => c.name === 'README.md');
    expect(readmeCheck?.passed).toBe(false);
  });

  it('should return score between 0 and 100', () => {
    const result = runQualityChecks('/tmp');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should return array of checks', () => {
    const result = runQualityChecks('/tmp');
    expect(result.checks).toBeDefined();
    expect(Array.isArray(result.checks)).toBe(true);
    expect(result.checks.length).toBeGreaterThan(0);
  });
});
