import { describe, it, expect } from 'vitest';
import { fetchTemplateFromGitHub } from './community.js';

describe('Community Templates', () => {
  describe('fetchTemplateFromGitHub', () => {
    it('should parse valid GitHub source', async () => {
      const template = await fetchTemplateFromGitHub('github:user/repo');
      expect(template.name).toBe('repo');
      expect(template.source).toBe('https://github.com/user/repo.git');
    });

    it('should handle .git suffix', async () => {
      const template = await fetchTemplateFromGitHub('github:user/repo.git');
      expect(template.name).toBe('repo');
    });

    it('should reject invalid format', async () => {
      await expect(fetchTemplateFromGitHub('invalid')).rejects.toThrow('无效的 GitHub 源格式');
    });

    it('should reject missing repo', async () => {
      await expect(fetchTemplateFromGitHub('github:user')).rejects.toThrow('无效的 GitHub 源格式');
    });

    it('should reject invalid owner characters', async () => {
      await expect(fetchTemplateFromGitHub('github:us er/repo')).rejects.toThrow(
        '无效的 GitHub 用户名格式'
      );
    });

    it('should reject invalid repo characters', async () => {
      await expect(fetchTemplateFromGitHub('github:user/re po')).rejects.toThrow(
        '无效的 GitHub 仓库名格式'
      );
    });

    it('should accept valid owner with dots and hyphens', async () => {
      const template = await fetchTemplateFromGitHub('github:user.name/repo-name');
      expect(template.name).toBe('repo-name');
    });
  });
});
