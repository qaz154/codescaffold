import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { generateProject } from '../template/generator';
import { handleCLIError } from '../utils/errors';
import { TEMPLATE_VARIANTS } from '../template/variants';

interface InitOptions {
  template?: string;
  output?: string;
  force?: boolean;
}

const AVAILABLE_TEMPLATES = [
  {
    name: 'Next.js Full-Stack',
    value: 'nextjs-fullstack',
    description: 'Next.js 15 + Express + Prisma + PostgreSQL',
  },
  {
    name: 'Express REST API',
    value: 'express-api',
    description: 'Express + Prisma + PostgreSQL/MySQL',
  },
  {
    name: 'Python FastAPI',
    value: 'python-fastapi',
    description: 'FastAPI + SQLAlchemy + Alembic + PostgreSQL',
  },
  {
    name: 'Go Microservice',
    value: 'go-microservice',
    description: 'Go 1.22 + Gin + pgx + PostgreSQL',
  },
];

export async function initCommand(options: InitOptions) {
  const spinner = ora({
    text: chalk.cyan('Starting project initialization...'),
    spinner: 'dots',
  }).start();

  try {
    const outputDir = options.output || '.';

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-project',
        validate: input => {
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name should only contain letters, numbers, hyphens, and underscores';
          }
          if (/^[.-]/.test(input)) {
            return 'Project name cannot start with hyphen or dot';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A full-stack application built with CodeScaffold',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: 'Developer',
      },
      {
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: AVAILABLE_TEMPLATES,
        default: options.template || 'nextjs-fullstack',
      },
      {
        type: 'list',
        name: 'variant',
        message: 'Select a template variant:',
        choices: [
          { name: 'Default - Standard setup', value: 'default' },
          { name: 'With Authentication - Includes JWT auth', value: 'with-auth' },
        ],
        default: 'default',
        when: answers => {
          const variants = TEMPLATE_VARIANTS[answers.template as string];
          return variants && variants.length > 1;
        },
      },
      {
        type: 'confirm',
        name: 'useAi',
        message: 'Enable AI-enhanced features?',
        default: false,
      },
    ]);

    spinner.text = chalk.cyan('Generating project structure...');

    // Auto-select variant if only one exists
    const templateVariants = TEMPLATE_VARIANTS[answers.template as string];
    const selectedVariant =
      templateVariants && templateVariants.length > 1 ? answers.variant : 'default';

    if (templateVariants && templateVariants.length > 1) {
      console.log(chalk.gray(`\nSelected variant: ${selectedVariant}`));
    }

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const projectPath = await generateProject({
      name: answers.projectName,
      description: answers.description,
      author: answers.author,
      template: answers.template,
      output: outputDir,
      force: options.force || false,
      useAi: answers.useAi,
    });

    spinner.succeed(chalk.green(`Project generated successfully at ${chalk.bold(projectPath)}`));

    console.log(chalk.green('\n✓ Next steps:'));
    console.log(chalk.gray(`  cd ${answers.projectName}`));
    console.log(chalk.gray('  npm install'));
    console.log(chalk.gray('  npm run dev'));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Project generation failed'));
    handleCLIError(error);
    process.exit(1);
  }
}
