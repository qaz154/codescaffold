import chalk from 'chalk';
import { ProjectConfig } from '../components/index.js';

export interface SmartSuggestion {
  feature: string;
  reason: string;
  confidence: number;
}

export function analyzeConfig(config: ProjectConfig): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  // 根据框架推荐功能
  if (config.framework.id.startsWith('nextjs')) {
    suggestions.push({
      feature: 'App Router',
      reason: 'Next.js 15 推荐使用 App Router',
      confidence: 0.95,
    });
    suggestions.push({
      feature: 'Server Components',
      reason: '利用 React Server Components 提升性能',
      confidence: 0.9,
    });
  }

  // 根据数据库推荐功能
  if (config.database?.id.startsWith('prisma')) {
    suggestions.push({
      feature: 'Prisma Migrate',
      reason: '使用 Prisma 管理数据库迁移',
      confidence: 0.95,
    });
  }

  // 根据认证推荐功能
  if (config.auth?.id === 'nextauth') {
    suggestions.push({
      feature: 'NextAuth Providers',
      reason: '添加 OAuth 登录（GitHub, Google）',
      confidence: 0.85,
    });
  }

  // 根据 UI 推荐功能
  if (config.ui?.id === 'tailwind-shadcn') {
    suggestions.push({
      feature: 'shadcn/ui Components',
      reason: '使用预构建的 UI 组件加速开发',
      confidence: 0.9,
    });
  }

  return suggestions;
}

export function printSuggestions(suggestions: SmartSuggestion[]): void {
  if (suggestions.length === 0) return;

  console.log(chalk.cyan('\n💡 智能建议:\n'));

  for (const s of suggestions) {
    const confidence = Math.round(s.confidence * 100);
    const bar =
      '█'.repeat(Math.floor(confidence / 10)) + '░'.repeat(10 - Math.floor(confidence / 10));
    console.log(`  ${chalk.bold(s.feature)}`);
    console.log(`    ${chalk.dim(s.reason)}`);
    console.log(`    ${chalk.cyan(bar)} ${chalk.dim(`${confidence}%`)}`);
  }
}

export function generateSmartReadme(config: ProjectConfig): string {
  const suggestions = analyzeConfig(config);

  return `# ${config.name}

使用 CodeScaffold 创建的项目

## 技术栈

- **框架**: ${config.framework.name}
${config.database ? `- **数据库**: ${config.database.name}` : ''}
${config.auth ? `- **认证**: ${config.auth.name}` : ''}
${config.ui ? `- **UI**: ${config.ui.name}` : ''}

## 智能建议

${suggestions.map(s => `- **${s.feature}**: ${s.reason}`).join('\n')}

## 开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

## 项目结构

\`\`\`
${config.name}/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── public/
└── package.json
\`\`\`

## 了解更多

- [CodeScaffold 文档](https://github.com/qaz154/codescaffold)
`;
}
