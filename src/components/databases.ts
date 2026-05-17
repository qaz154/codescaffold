import { ComponentCategory } from './types';

export const databases: ComponentCategory = {
  id: 'database',
  name: '数据库',
  description: '选择数据库 ORM（可选）',
  required: false,
  options: [
    {
      id: 'prisma-pg',
      name: 'Prisma + PostgreSQL',
      description: '类型安全的 ORM + PostgreSQL',
      dependencies: {
        '@prisma/client': '^5.22.0',
      },
      devDependencies: {
        prisma: '^5.22.0',
      },
    },
    {
      id: 'prisma-sqlite',
      name: 'Prisma + SQLite',
      description: '类型安全的 ORM + SQLite（轻量级）',
      dependencies: {
        '@prisma/client': '^5.22.0',
      },
      devDependencies: {
        prisma: '^5.22.0',
      },
    },
    {
      id: 'drizzle-pg',
      name: 'Drizzle + PostgreSQL',
      description: 'TypeScript 优先的 ORM + PostgreSQL',
      dependencies: {
        'drizzle-orm': '^0.36.0',
        postgres: '^3.4.0',
      },
      devDependencies: {
        'drizzle-kit': '^0.28.0',
      },
    },
    {
      id: 'drizzle-sqlite',
      name: 'Drizzle + SQLite',
      description: 'TypeScript 优先的 ORM + SQLite',
      dependencies: {
        'drizzle-orm': '^0.36.0',
        'better-sqlite3': '^11.6.0',
      },
      devDependencies: {
        'drizzle-kit': '^0.28.0',
        '@types/better-sqlite3': '^7.6.12',
      },
    },
    {
      id: 'none',
      name: '无数据库',
      description: '不使用数据库',
      dependencies: {},
    },
  ],
};
