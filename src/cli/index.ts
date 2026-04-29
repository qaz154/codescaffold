#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { initCommand } from '../commands/init';
import { listCommand } from '../commands/list';
import { version } from '../utils/version';

const asciiLogo = `
${chalk.cyan('███╗   ███╗███████╗██████╗ ██╗ ██████╗')})
${chalk.cyan('████╗ ████║██╔════╝██╔══██╗██║██╔════╝')}
${chalk.cyan('██╔████╔██║█████╗  ██████╔╝██║██║  ███╗')}
${chalk.cyan('██║╚██╔╝██║██╔══╝  ██╔══██╗██║██║   ██║')}
${chalk.cyan('██║ ╚═╝ ██║███████╗██║  ██║██║╚██████╔╝')}
${chalk.cyan('╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝ ')}

${chalk.white('AI-Powered Full-Stack Project Scaffold Generator')}
`;

function showBanner() {
  console.log(chalk.bold(asciiLogo));
  console.log(
    boxen(
      `${chalk.green('CodeScaffold')} v${version}\n` +
      `${chalk.gray('Generate production-ready project scaffolds in seconds')}`,
      { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
    )
  );
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
  .option('-t, --template <name>', 'Template to use', 'nextjs-fullstack')
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

showBanner();

program.parse();
