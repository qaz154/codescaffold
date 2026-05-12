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
