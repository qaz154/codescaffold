import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { generateProject } from '../template/generator.js';
import { handleCLIError, ValidationError, TemplateError } from '../utils/errors.js';
import { printNextSteps } from '../utils/next-steps.js';

interface CreateOptions {
  template?: string;
  output?: string;
  force?: boolean;
}

const AVAILABLE_TEMPLATES = [
  'nextjs-fullstack',
  'express-api',
  'python-fastapi',
  'go-microservice',
];

export async function createCommand(name: string, options: CreateOptions) {
  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Project name is required');
  }

  // Get template if not provided
  if (!options.template) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: AVAILABLE_TEMPLATES.map(t => ({
          name: t,
          value: t,
        })),
      },
    ]);
    options.template = answers.template;
  }

  // Get force confirmation if not provided
  if (options.force === undefined) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'force',
        message: 'Overwrite existing files?',
        default: false,
      },
    ]);
    options.force = answers.force;
  }

  const spinner = ora({
    text: chalk.cyan(`Creating project ${chalk.bold(name)}...`),
    spinner: 'dots',
  }).start();

  try {
    if (!options.template) {
      throw new ValidationError('Template is required');
    }

    const projectPath = await generateProject({
      name: name.trim(),
      description: `A full-stack application built with CodeScaffold`,
      author: 'Developer',
      template: options.template,
      output: options.output || '.',
      force: options.force || false,
      useAi: false,
    });

    spinner.succeed(chalk.green(`Project created successfully at ${chalk.bold(projectPath)}`));

    printNextSteps(name, options.template);
  } catch (error) {
    spinner.fail(chalk.red('Project creation failed'));

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        throw new TemplateError(
          `Template "${options.template}" not found`,
          'Run "codescaffold list" to see available templates'
        );
      }
      if (error.message.includes('already exists')) {
        throw new ValidationError(
          error.message,
          'Use --force to overwrite, or choose a different project name'
        );
      }
    }

    handleCLIError(error);
    process.exit(1);
  }
}
