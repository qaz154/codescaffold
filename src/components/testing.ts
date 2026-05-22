import { ComponentCategory } from './types.js';

export const testing: ComponentCategory = {
  id: 'testing',
  name: '测试框架',
  description: '选择测试框架（可选）',
  required: false,
  options: [
    {
      id: 'vitest',
      name: 'Vitest',
      description: '快速的单元测试框架（推荐）',
      dependencies: {},
      devDependencies: {
        vitest: '^2.1.0',
        '@vitest/ui': '^2.1.0',
      },
    },
    {
      id: 'jest',
      name: 'Jest',
      description: '流行的 JavaScript 测试框架',
      dependencies: {},
      devDependencies: {
        jest: '^29.7.0',
        '@types/jest': '^29.5.14',
        'ts-jest': '^29.2.5',
      },
    },
    {
      id: 'playwright',
      name: 'Playwright',
      description: 'E2E 测试框架',
      dependencies: {},
      devDependencies: {
        '@playwright/test': '^1.49.0',
      },
    },
    {
      id: 'cypress',
      name: 'Cypress',
      description: 'E2E 测试框架',
      dependencies: {},
      devDependencies: {
        cypress: '^13.15.0',
      },
    },
    {
      id: 'none',
      name: '无测试',
      description: '不添加测试框架',
      dependencies: {},
    },
  ],
};
