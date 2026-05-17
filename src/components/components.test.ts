import { describe, it, expect } from 'vitest';
import { frameworks, databases, auth, ui } from './index';

describe('Component Definitions', () => {
  describe('frameworks', () => {
    it('should have 5 framework options', () => {
      expect(frameworks.options).toHaveLength(5);
    });

    it('should require framework selection', () => {
      expect(frameworks.required).toBe(true);
    });

    it('should have unique IDs', () => {
      const ids = frameworks.options.map(opt => opt.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have Next.js App Router option', () => {
      const nextjs = frameworks.options.find(opt => opt.id === 'nextjs-app');
      expect(nextjs).toBeDefined();
      expect(nextjs?.dependencies['next']).toBeDefined();
    });

    it('should have Express API option', () => {
      const express = frameworks.options.find(opt => opt.id === 'express-api');
      expect(express).toBeDefined();
      expect(express?.dependencies['express']).toBeDefined();
    });
  });

  describe('databases', () => {
    it('should have 5 database options', () => {
      expect(databases.options).toHaveLength(5);
    });

    it('should not require database', () => {
      expect(databases.required).toBe(false);
    });

    it('should have Prisma PostgreSQL option', () => {
      const prisma = databases.options.find(opt => opt.id === 'prisma-pg');
      expect(prisma).toBeDefined();
      expect(prisma?.dependencies['@prisma/client']).toBeDefined();
    });
  });

  describe('auth', () => {
    it('should have 4 auth options', () => {
      expect(auth.options).toHaveLength(4);
    });

    it('should not require auth', () => {
      expect(auth.required).toBe(false);
    });

    it('should have NextAuth option', () => {
      const nextauth = auth.options.find(opt => opt.id === 'nextauth');
      expect(nextauth).toBeDefined();
      expect(nextauth?.dependencies['next-auth']).toBeDefined();
    });
  });

  describe('ui', () => {
    it('should have 5 UI options', () => {
      expect(ui.options).toHaveLength(5);
    });

    it('should not require UI', () => {
      expect(ui.required).toBe(false);
    });

    it('should have Tailwind + shadcn option', () => {
      const tailwind = ui.options.find(opt => opt.id === 'tailwind-shadcn');
      expect(tailwind).toBeDefined();
      expect(tailwind?.dependencies['tailwindcss']).toBeDefined();
    });
  });
});
