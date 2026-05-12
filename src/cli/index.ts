#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { initCommand } from '../commands/init';
import { listCommand } from '../commands/list';
import { version, checkForUpdates, printUpdateNotice } from '../utils/version';
import { printConfigInfo } from '../utils/config';
import { getAIService } from '../ai/openai-service';

function printAIStatus(): void {
  const service = getAIService();
  const { provider, model } = service.getProviderInfo();

  const statusText = service.isConfigured()
    ? chalk.green('✓ Configured')
    : chalk.yellow('⚠ Not configured');

  console.log(chalk.dim(`  AI Provider: ${chalk.cyan(provider)} (${model}) ${statusText}`));
}

const asciiLogo = `
${chalk.cyan('███╗   ███╗███████╗██████╗ ██╗ ██████╗')}
${chalk.cyan('████╗ ████║██╔════╝██╔══██╗██║██╔════╝')}
${chalk.cyan('██╔████╔██║█████╗  ██████╔╝██║██║  ███╗')}
${chalk.cyan('██║╚██╔╝██║██╔══╝  ██╔══██╗██║██║   ██║')}
${chalk.cyan('██║ ╚═╝ ██║███████╗██║  ██║██║╚██████╔╝')}
${chalk.cyan('╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ')}

${chalk.white('AI-Powered Full-Stack Project Scaffold Generator')}
`;

function showBanner(): void {
  console.log(chalk.bold(asciiLogo));
  console.log(
    boxen(
      `${chalk.green('CodeScaffold')} v${version}\n` +
      `${chalk.gray('Generate production-ready project scaffolds in seconds')}\n\n` +
      `${chalk.dim('Multi-model AI support: OpenAI, Claude, Local LLMs')}`,
      { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
    )
  );
  console.log();
}

function showSystemInfo(): void {
  console.log(chalk.dim('System Info:'));
  printAIStatus();
  printConfigInfo();
  console.log();
}

program
  .name('codescaffold')
  .description('AI-Powered Full-Stack Project Scaffold Generator')
  .version(version);

program
  .command('init')
  .description('Initialize a new project with interactive prompts')
  .option('-t, --template <name>', 'Template to use')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--provider <provider>', 'AI provider (openai, claude, local)')
  .option('--model <model>', 'AI model to use')
  .action(initCommand);

program
  .command('list')
  .description('List all available templates')
  .action(listCommand);

program
  .command('info <template>')
  .description('Show detailed information about a template')
  .action(async (template) => {
    const { infoCommand } = await import('../commands/info');
    await infoCommand(template);
  });

program
  .command('create <name>')
  .description('Create a new project from template')
  .option('-t, --template <name>', 'Template to use', 'express-api')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-f, --force', 'Overwrite existing files', false)
  .action(async (name, options) => {
    const { createCommand } = await import('../commands/create');
    await createCommand(name, options);
  });

program
  .command('generate')
  .description('Generate project from natural language requirements (AI-powered)')
  .option('-r, --requirement <text>', 'Natural language requirement')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--provider <provider>', 'AI provider (openai, claude, local)')
  .option('--model <model>', 'AI model to use')
  .action(async (options) => {
    const { generateCommand } = await import('../commands/generate');
    await generateCommand(options);
  });

program
  .command('serve')
  .description('Start the CodeScaffold Web UI')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .action(async (options) => {
    const { serveCommand } = await import('../commands/serve');
    await serveCommand(options);
  });

program
  .command('config')
  .description('Create or manage CodeScaffold configuration')
  .option('--init', 'Create default config file in current directory')
  .option('--show', 'Show current configuration')
  .option('--reset-prefs', 'Reset user preferences')
  .option('--clear-cache', 'Clear offline cache')
  .action(async (options) => {
    const { configCommand } = await import('../commands/config');
    await configCommand(options);
  });

program
  .command('presets')
  .description('Quick-start with project presets (API, SaaS, ML, etc.)')
  .action(async () => {
    const { presetsCommand } = await import('../commands/presets');
    await presetsCommand();
  });

program
  .command('validate')
  .description('Validate a CodeScaffold-generated project')
  .option('-d, --directory <path>', 'Project directory to validate', '.')
  .action(async (options) => {
    const { validateCommand } = await import('../commands/validate');
    await validateCommand(options);
  });

program
  .command('upgrade')
  .description('Upgrade existing project to latest template version')
  .option('-d, --directory <path>', 'Project directory to upgrade', '.')
  .option('-f, --force', 'Skip confirmation prompts', false)
  .option('--no-backup', 'Skip backup creation')
  .action(async (options) => {
    const { upgradeCommand } = await import('../commands/upgrade');
    await upgradeCommand(options);
  });

program
  .command('compose')
  .description('使用组件化方式创建项目')
  .option('-n, --name <name>', '项目名称')
  .option('--minimal', '最小化模式（仅选择框架）')
  .option('--empty', '空模式（无数据库、认证、UI）')
  .option('--defaults', '零配置模式（使用推荐默认值）')
  .option('--yes', '使用默认配置，跳过确认')
  .option('--pkg <manager>', '包管理器 (npm/yarn/pnpm/bun)')
  .option('--current-dir', '在当前目录创建项目')
  .option('-o, --output <path>', '输出目录', '.')
  .action(async (options) => {
    const { composeCommand } = await import('../commands/compose');
    await composeCommand(options);
  });

program
  .command('template')
  .description('管理社区模板')
  .option('-l, --list', '列出所有模板')
  .option('-a, --add <source>', '添加模板 (github:user/repo)')
  .option('-r, --remove <name>', '移除模板')
  .option('-s, --search <query>', '搜索模板')
  .option('-v, --version <name>', '查看模板版本')
  .action(async (options) => {
    const { templateCommand } = await import('../commands/template');
    await templateCommand(options);
  });

program
  .command('migrate')
  .description('从现有项目迁移到新架构')
  .option('-s, --source <path>', '源项目路径', '.')
  .option('-t, --target <path>', '目标路径')
  .option('-f, --framework <name>', '目标框架')
  .option('--dry', '仅预览，不实际迁移')
  .action(async (options) => {
    const { migrateCommand } = await import('../commands/migrate');
    await migrateCommand(options);
  });

async function main(): Promise<void> {
  showBanner();
  showSystemInfo();

  const updateInfo = await checkForUpdates();
  if (updateInfo?.hasUpdate) {
    printUpdateNotice(updateInfo.latestVersion);
  }

  program.parse();
}

main().catch((error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
