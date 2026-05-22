import { describe, it, expect } from 'vitest';
import { checkCompatibility, getRecommendedComponents } from './dependencies.js';

describe('Dependencies', () => {
  describe('checkCompatibility', () => {
    it('should pass for compatible components', () => {
      const result = checkCompatibility('nextjs-app', 'prisma-pg', 'nextauth', 'tailwind-shadcn');
      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when NextAuth used with non-Next.js', () => {
      const result = checkCompatibility('express-api', null, 'nextauth', null);
      expect(result.compatible).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('NextAuth.js');
    });

    it('should fail when Clerk used with non-Next.js', () => {
      const result = checkCompatibility('express-api', null, 'clerk', null);
      expect(result.compatible).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when Prisma used with Go', () => {
      const result = checkCompatibility('go-gin', 'prisma-pg', null, null);
      expect(result.compatible).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when shadcn used with non-React', () => {
      const result = checkCompatibility('express-api', null, null, 'tailwind-shadcn');
      expect(result.compatible).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass with no optional components', () => {
      const result = checkCompatibility('express-api', null, null, null);
      expect(result.compatible).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getRecommendedComponents', () => {
    it('should return NextAuth for Next.js', () => {
      const rec = getRecommendedComponents('nextjs-app');
      expect(rec.auth).toContain('nextauth');
    });

    it('should return JWT for Express', () => {
      const rec = getRecommendedComponents('express-api');
      expect(rec.auth).toContain('jwt');
    });

    it('should return empty for unknown framework', () => {
      const rec = getRecommendedComponents('unknown');
      expect(rec.database).toHaveLength(0);
      expect(rec.auth).toHaveLength(0);
      expect(rec.ui).toHaveLength(0);
    });
  });
});
