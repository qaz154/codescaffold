import chalk from 'chalk';
import { ProjectConfig } from './types';

export function generateProjectPreview(config: ProjectConfig): string {
  const lines: string[] = [];

  lines.push(chalk.cyan('\n📁 项目结构预览:\n'));

  // 根目录
  lines.push(chalk.bold(`${config.name}/`));

  // 框架特定结构
  if (config.framework.id.startsWith('nextjs')) {
    lines.push('├── app/                    # Next.js App Router');
    lines.push('│   ├── layout.tsx          # 根布局');
    lines.push('│   └── page.tsx            # 首页');
    lines.push('├── components/             # React 组件');
    lines.push('├── lib/                    # 工具函数');
    lines.push('├── public/                 # 静态资源');
    lines.push('├── prisma/                 # 数据库 Schema');
    lines.push('├── .env.local              # 环境变量');
    lines.push('├── next.config.ts          # Next.js 配置');
    lines.push('├── package.json            # 依赖管理');
    lines.push('├── tailwind.config.ts      # Tailwind 配置');
    lines.push('└── tsconfig.json           # TypeScript 配置');
  } else if (config.framework.id === 'express-api') {
    lines.push('├── src/');
    lines.push('│   ├── controllers/        # 控制器');
    lines.push('│   ├── middleware/          # 中间件');
    lines.push('│   ├── routes/             # 路由');
    lines.push('│   ├── utils/              # 工具函数');
    lines.push('│   └── index.ts            # 入口文件');
    lines.push('├── .env                    # 环境变量');
    lines.push('├── package.json            # 依赖管理');
    lines.push('├── tsconfig.json           # TypeScript 配置');
    lines.push('└── Dockerfile              # Docker 配置');
  } else if (config.framework.id === 'fastapi') {
    lines.push('├── app/');
    lines.push('│   ├── __init__.py');
    lines.push('│   ├── main.py             # FastAPI 入口');
    lines.push('│   ├── models.py           # 数据模型');
    lines.push('│   ├── schemas.py          # Pydantic 模型');
    lines.push('│   └── routers/            # API 路由');
    lines.push('├── tests/                  # 测试目录');
    lines.push('├── .env                    # 环境变量');
    lines.push('├── pyproject.toml          # 依赖管理');
    lines.push('├── requirements.txt        # 依赖列表');
    lines.push('└── Dockerfile              # Docker 配置');
  } else if (config.framework.id === 'go-gin') {
    lines.push('├── cmd/');
    lines.push('│   └── server/');
    lines.push('│       └── main.go         # 入口文件');
    lines.push('├── internal/');
    lines.push('│   ├── handlers/           # 处理器');
    lines.push('│   ├── middleware/          # 中间件');
    lines.push('│   ├── models/             # 数据模型');
    lines.push('│   └── routes/             # 路由');
    lines.push('├── pkg/                    # 公共包');
    lines.push('├── go.mod                  # Go 模块');
    lines.push('├── go.sum                  # 依赖锁定');
    lines.push('└── Dockerfile              # Docker 配置');
  }

  // 数据库特定文件
  if (config.database?.id.startsWith('prisma')) {
    lines.push('');
    lines.push(chalk.dim('  # Prisma 相关'));
    lines.push('  prisma/schema.prisma      # 数据库 Schema');
    lines.push('  prisma/migrations/        # 数据库迁移');
  } else if (config.database?.id.startsWith('drizzle')) {
    lines.push('');
    lines.push(chalk.dim('  # Drizzle 相关'));
    lines.push('  drizzle/                  # Drizzle 迁移');
    lines.push('  drizzle.config.ts         # Drizzle 配置');
  }

  // 认证特定文件
  if (config.auth?.id === 'nextauth') {
    lines.push('');
    lines.push(chalk.dim('  # NextAuth.js 相关'));
    lines.push('  app/api/auth/[...nextauth]/route.ts');
    lines.push('  lib/auth.ts               # 认证配置');
  } else if (config.auth?.id === 'jwt') {
    lines.push('');
    lines.push(chalk.dim('  # JWT 相关'));
    lines.push('  src/utils/jwt.ts          # JWT 工具');
    lines.push('  src/middleware/auth.ts    # 认证中间件');
  }

  // UI 特定文件
  if (config.ui?.id === 'tailwind-shadcn') {
    lines.push('');
    lines.push(chalk.dim('  # shadcn/ui 相关'));
    lines.push('  components/ui/            # UI 组件');
    lines.push('  lib/utils.ts              # 工具函数');
    lines.push('  styles/globals.css        # 全局样式');
  }

  // 配置文件
  lines.push('');
  lines.push(chalk.dim('  # 配置文件'));
  lines.push('  .env.example              # 环境变量示例');
  lines.push('  .gitignore                # Git 忽略');
  lines.push('  README.md                 # 项目文档');

  return lines.join('\n');
}

export function printProjectPreview(config: ProjectConfig): void {
  const preview = generateProjectPreview(config);
  console.log(preview);
}
