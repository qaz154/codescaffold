import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  'nextjs-fullstack':
    'Next.js 15 + Express + Prisma + PostgreSQL - Full-stack application template',
  'express-api': 'Express REST API + Prisma + PostgreSQL/MySQL - Backend API template',
  'python-fastapi': 'Python FastAPI + SQLAlchemy + Alembic + PostgreSQL - Python API template',
  'go-microservice': 'Go 1.22 + Gin + pgx + PostgreSQL - Go microservice template',
};

export async function listCommand() {
  const templatesDir = path.join(__dirname, '../../templates');

  console.log(chalk.bold('\nAvailable Templates:\n'));

  try {
    const templateDirs = fs.readdirSync(templatesDir).filter(dir => {
      const stat = fs.statSync(path.join(templatesDir, dir));
      return stat.isDirectory();
    });

    for (const dir of templateDirs) {
      const description = TEMPLATE_DESCRIPTIONS[dir] || 'No description available';

      const templateBox = boxen(
        `${chalk.cyan('Template:')} ${chalk.bold(dir)}\n` +
          `${chalk.gray('Description:')} ${description}`,
        { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
      );
      console.log(templateBox);
    }

    console.log(
      chalk.gray('\nUse ') +
        chalk.cyan('codescaffold init') +
        chalk.gray(' to start creating a project')
    );
    console.log(
      chalk.gray('Or use ') +
        chalk.cyan('codescaffold create <name> --template <template>') +
        chalk.gray(' for quick generation\n')
    );
  } catch {
    console.error(chalk.red('Failed to list templates'));
    process.exit(1);
  }
}
