#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { initCommand } from '../commands/init.js';
import { listCommand } from '../commands/list.js';
import { version, checkForUpdates, printUpdateNotice } from '../utils/version.js';
import { printConfigInfo } from '../utils/config.js';
import { getAIService } from '../ai/openai-service.js';

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
  const isVersionFlag = process.argv.includes('--version') || process.argv.includes('-V');
  const isHelpFlag = process.argv.includes('--help') || process.argv.includes('-h');

  if (
    process.stdout.isTTY !== false &&
    !process.argv.includes('--quiet') &&
    !isVersionFlag &&
    !isHelpFlag
  ) {
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
}

function showSystemInfo(): void {
  if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
    console.log(chalk.dim('System Info:'));
    printAIStatus();
    printConfigInfo();
    console.log();
  }
}

program
  .name('codescaffold')
  .description('AI-Powered Full-Stack Project Scaffold Generator')
  .version(version)
  .option('-q, --quiet', 'Suppress startup banner')
  .option('-v, --verbose', 'Show system information');

program
  .command('init')
  .description('Initialize a new project with interactive prompts')
  .option('-t, --template <name>', 'Template to use')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-f, --force', 'Overwrite existing files', false)
  .option('--provider <provider>', 'AI provider (openai, claude, local)')
  .option('--model <model>', 'AI model to use')
  .action(initCommand);

program.command('list').description('List all available templates').action(listCommand);

program
  .command('info <template>')
  .description('Show detailed information about a template')
  .action(async template => {
    const { infoCommand } = await import('../commands/info.js');
    await infoCommand(template);
  });

program
  .command('create <name>')
  .description('Create a new project from template')
  .option('-t, --template <name>', 'Template to use', 'express-api')
  .option('-o, --output <path>', 'Output directory', '.')
  .option('-f, --force', 'Overwrite existing files', false)
  .action(async (name, options) => {
    const { createCommand } = await import('../commands/create.js');
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
  .option('--preview', 'Preview what AI would generate without writing files')
  .action(async options => {
    const { generateCommand } = await import('../commands/generate.js');
    await generateCommand(options);
  });

program
  .command('serve')
  .description('Start the CodeScaffold Web UI')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .action(async options => {
    const { serveCommand } = await import('../commands/serve.js');
    await serveCommand(options);
  });

program
  .command('config')
  .description('Create or manage CodeScaffold configuration')
  .option('--init', 'Create default config file in current directory')
  .option('--show', 'Show current configuration')
  .option('--reset-prefs', 'Reset user preferences')
  .option('--clear-cache', 'Clear offline cache')
  .action(async options => {
    const { configCommand } = await import('../commands/config.js');
    await configCommand(options);
  });

program
  .command('presets')
  .description('Quick-start with project presets (API, SaaS, ML, etc.)')
  .action(async () => {
    const { presetsCommand } = await import('../commands/presets.js');
    await presetsCommand();
  });

program
  .command('validate')
  .description('Validate a CodeScaffold-generated project')
  .option('-d, --directory <path>', 'Project directory to validate', '.')
  .action(async options => {
    const { validateCommand } = await import('../commands/validate.js');
    await validateCommand(options);
  });

program
  .command('upgrade')
  .description('Upgrade existing project to latest template version')
  .option('-d, --directory <path>', 'Project directory to upgrade', '.')
  .option('-f, --force', 'Skip confirmation prompts', false)
  .option('--no-backup', 'Skip backup creation')
  .action(async options => {
    const { upgradeCommand } = await import('../commands/upgrade.js');
    await upgradeCommand(options);
  });

program
  .command('compose')
  .description('Create project from composable components')
  .option('-n, --name <name>', 'Project name')
  .option('--minimal', 'Minimal mode (framework only)')
  .option('--empty', 'Empty mode (no database, auth, or UI)')
  .option('--defaults', 'Zero-config mode (use recommended defaults)')
  .option('--yes', 'Accept defaults, skip confirmation')
  .option('--pkg <manager>', 'Package manager (npm/yarn/pnpm/bun)')
  .option('--current-dir', 'Create project in current directory')
  .option('--preview', 'Preview project structure without writing files')
  .option('-o, --output <path>', 'Output directory', '.')
  .action(async options => {
    const { composeCommand } = await import('../commands/compose.js');
    await composeCommand(options);
  });

program
  .command('template')
  .description('Manage community templates')
  .option('-l, --list', 'List all templates')
  .option('-a, --add <source>', 'Add template (github:user/repo)')
  .option('-r, --remove <name>', 'Remove template')
  .option('-s, --search <query>', 'Search templates')
  .option('-v, --version <name>', 'View template version')
  .action(async options => {
    const { templateCommand } = await import('../commands/template.js');
    await templateCommand(options);
  });

program
  .command('migrate')
  .description('Migrate from existing project to new architecture')
  .option('-s, --source <path>', 'Source project path', '.')
  .option('-t, --target <path>', 'Target path')
  .option('-f, --framework <name>', 'Target framework')
  .option('--dry', 'Preview only, no actual migration')
  .action(async options => {
    const { migrateCommand } = await import('../commands/migrate.js');
    await migrateCommand(options);
  });

program
  .command('doctor')
  .description('Scan project health and suggest fixes')
  .option('-d, --directory <path>', 'Project directory to scan', '.')
  .option('--fix', 'Auto-fix issues where possible')
  .action(async options => {
    const { doctorCommand } = await import('../commands/doctor.js');
    await doctorCommand(options);
  });

async function main(): Promise<void> {
  showBanner();
  showSystemInfo();

  const updateInfo = await checkForUpdates();
  if (updateInfo?.hasUpdate) {
    printUpdateNotice(updateInfo.latestVersion);
  }

  await program.parseAsync();
}

main().catch(error => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});
