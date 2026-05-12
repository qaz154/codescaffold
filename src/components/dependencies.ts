import chalk from 'chalk';

export interface DependencyRule {
  source: string;      // 依赖方
  target: string;      // 被依赖方
  type: 'requires' | 'incompatible' | 'optional';
  message: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  errors: DependencyRule[];
  warnings: DependencyRule[];
}

// 依赖规则定义
const DEPENDENCY_RULES: DependencyRule[] = [
  // NextAuth 只能在 Next.js 中使用
  {
    source: 'nextauth',
    target: 'nextjs-app',
    type: 'requires',
    message: 'NextAuth.js 需要 Next.js 框架',
  },
  {
    source: 'nextauth',
    target: 'nextjs-pages',
    type: 'requires',
    message: 'NextAuth.js 需要 Next.js 框架',
  },

  // Clerk 只能在 Next.js 中使用
  {
    source: 'clerk',
    target: 'nextjs-app',
    type: 'requires',
    message: 'Clerk 需要 Next.js 框架',
  },
  {
    source: 'clerk',
    target: 'nextjs-pages',
    type: 'requires',
    message: 'Clerk 需要 Next.js 框架',
  },

  // Tailwind + shadcn 只能在 Next.js 或 React 中使用
  {
    source: 'tailwind-shadcn',
    target: 'nextjs-app',
    type: 'requires',
    message: 'shadcn/ui 需要 React/Next.js',
  },
  {
    source: 'tailwind-shadcn',
    target: 'nextjs-pages',
    type: 'requires',
    message: 'shadcn/ui 需要 React/Next.js',
  },

  // Prisma 不兼容 Go
  {
    source: 'prisma-pg',
    target: 'go-gin',
    type: 'incompatible',
    message: 'Prisma 不支持 Go，建议使用 GORM',
  },
  {
    source: 'prisma-sqlite',
    target: 'go-gin',
    type: 'incompatible',
    message: 'Prisma 不支持 Go，建议使用 GORM',
  },

  // Drizzle 不兼容 Go
  {
    source: 'drizzle-pg',
    target: 'go-gin',
    type: 'incompatible',
    message: 'Drizzle 不支持 Go，建议使用 GORM',
  },
  {
    source: 'drizzle-sqlite',
    target: 'go-gin',
    type: 'incompatible',
    message: 'Drizzle 不支持 Go，建议使用 GORM',
  },

  // FastAPI 推荐 Python 数据库
  {
    source: 'prisma-pg',
    target: 'fastapi',
    type: 'incompatible',
    message: 'Prisma 是 Node.js ORM，FastAPI 建议使用 SQLAlchemy',
  },

  // JWT 可以在任何后端使用
  // NextAuth 只能在 Next.js 使用
  // Clerk 只能在 Next.js 使用
];

export function checkCompatibility(
  framework: string,
  database: string | null,
  auth: string | null,
  ui: string | null
): CompatibilityResult {
  const errors: DependencyRule[] = [];
  const warnings: DependencyRule[] = [];

  const components = [database, auth, ui].filter(Boolean);

  for (const component of components) {
    const rules = DEPENDENCY_RULES.filter((r) => r.source === component);

    for (const rule of rules) {
      if (rule.type === 'requires' && framework !== rule.target) {
        errors.push(rule);
      } else if (rule.type === 'incompatible' && framework === rule.target) {
        errors.push(rule);
      } else if (rule.type === 'optional' && framework !== rule.target) {
        warnings.push(rule);
      }
    }
  }

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
  };
}

export function printCompatibilityResult(result: CompatibilityResult): void {
  if (result.compatible) {
    console.log(chalk.green('\n✅ 组件兼容性检查通过'));
  } else {
    console.log(chalk.red('\n❌ 组件兼容性检查失败'));
    for (const error of result.errors) {
      console.log(chalk.red(`  ✗ ${error.message}`));
    }
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️ 警告:'));
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warning.message}`));
    }
  }
}

export function getRecommendedComponents(framework: string): {
  database: string[];
  auth: string[];
  ui: string[];
} {
  const recommendations: Record<string, { database: string[]; auth: string[]; ui: string[] }> = {
    'nextjs-app': {
      database: ['prisma-pg', 'drizzle-pg'],
      auth: ['nextauth', 'clerk'],
      ui: ['tailwind-shadcn', 'tailwind'],
    },
    'nextjs-pages': {
      database: ['prisma-pg', 'drizzle-pg'],
      auth: ['nextauth', 'clerk'],
      ui: ['tailwind-shadcn', 'tailwind'],
    },
    'express-api': {
      database: ['prisma-pg', 'drizzle-pg'],
      auth: ['jwt'],
      ui: ['none'],
    },
    'fastapi': {
      database: ['prisma-pg'],
      auth: ['jwt'],
      ui: ['none'],
    },
    'go-gin': {
      database: ['none'],
      auth: ['jwt'],
      ui: ['none'],
    },
  };

  return recommendations[framework] || { database: [], auth: [], ui: [] };
}
