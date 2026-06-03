import { describe, it, expect } from 'vitest';
import { getFilesToCopy, getFilesForFeatures, getAllFilesForGeneration } from './file-mapper.js';

describe('file-mapper', () => {
  describe('getFilesToCopy', () => {
    it('should return base files for express-api', () => {
      const files = getFilesToCopy('express-api');
      expect(files.length).toBeGreaterThan(0);
      const paths = files.map(f => f.outputPath);
      expect(paths).toContain('package.json');
      expect(paths).toContain('tsconfig.json');
    });

    it('should return base files for nextjs-fullstack', () => {
      const files = getFilesToCopy('nextjs-fullstack');
      expect(files.length).toBeGreaterThan(0);
      const paths = files.map(f => f.outputPath);
      expect(paths).toContain('package.json');
    });

    it('should return base files for python-fastapi', () => {
      const files = getFilesToCopy('python-fastapi');
      expect(files.length).toBeGreaterThan(0);
      const paths = files.map(f => f.outputPath);
      expect(paths).toContain('pyproject.toml');
    });

    it('should return empty array for unknown project type', () => {
      const files = getFilesToCopy('unknown' as any);
      expect(files).toEqual([]);
    });
  });

  describe('getFilesForFeatures', () => {
    it('should return feature files for auth feature', () => {
      const files = getFilesForFeatures('express-api', ['auth']);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown feature', () => {
      const files = getFilesForFeatures('express-api', ['nonexistent-feature']);
      expect(files).toEqual([]);
    });

    it('should return empty array for unknown project type', () => {
      const files = getFilesForFeatures('unknown' as any, ['auth']);
      expect(files).toEqual([]);
    });

    it('should deduplicate files across features', () => {
      const files = getFilesForFeatures('express-api', ['auth', 'user-management']);
      const paths = files.map(f => f.outputPath);
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });
  });

  describe('getAllFilesForGeneration', () => {
    it('should combine base and feature files', () => {
      const baseOnly = getFilesToCopy('express-api');
      const withFeatures = getAllFilesForGeneration('express-api', ['auth']);
      expect(withFeatures.length).toBeGreaterThanOrEqual(baseOnly.length);
    });

    it('should work with empty features', () => {
      const files = getAllFilesForGeneration('express-api', []);
      const baseFiles = getFilesToCopy('express-api');
      expect(files.length).toBe(baseFiles.length);
    });
  });
});
