import chalk from 'chalk';
import boxen from 'boxen';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TemplateInfo {
  name: string;
  description: string;
  techStack: string[];
  features: string[];
  files: string[];
}

const TEMPLATE_INFO: Record<string, TemplateInfo> = {
  'nextjs-fullstack': {
    name: 'Next.js Full-Stack',
    description:
      'Complete full-stack application with Next.js 15 App Router, Express backend, and Prisma ORM',
    techStack: [
      'Next.js 15',
      'React',
      'Express',
      'Prisma',
      'PostgreSQL',
      'TailwindCSS',
      'TypeScript',
    ],
    features: [
      'App Router',
      'API Routes',
      'Server Actions',
      'Auth Ready',
      'Docker Support',
      'GitHub Actions CI',
    ],
    files: [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.ts',
      'prisma/schema.prisma',
      'docker-compose.yml',
    ],
  },
  'express-api': {
    name: 'Express REST API',
    description:
      'Production-ready REST API with Express, Prisma ORM, and complete authentication system',
    techStack: ['Express', 'Prisma', 'PostgreSQL', 'JWT', 'bcrypt', 'TypeScript'],
    features: [
      'CRUD Operations',
      'JWT Authentication',
      'Role-based Access',
      'Input Validation',
      'Error Handling',
      'Docker Support',
    ],
    files: [
      'package.json',
      'tsconfig.json',
      'prisma/schema.prisma',
      'docker-compose.yml',
      'src/server.ts',
      'src/routes/*.ts',
    ],
  },
  'python-fastapi': {
    name: 'Python FastAPI',
    description: 'High-performance Python API with FastAPI, SQLAlchemy, and Alembic migrations',
    techStack: ['FastAPI', 'SQLAlchemy', 'Alembic', 'PostgreSQL', 'Pydantic', 'Python 3.11'],
    features: [
      'Auto-generated Docs',
      'Async Support',
      'Type Validation',
      'JWT Auth',
      'Database Migrations',
      'Docker Support',
    ],
    files: [
      'pyproject.toml',
      'alembic.ini',
      'app/main.py',
      'app/models.py',
      'app/schemas.py',
      'docker-compose.yml',
    ],
  },
  'go-microservice': {
    name: 'Go Microservice',
    description: 'Modern Go microservice with Gin framework, pgx driver, and Clean Architecture',
    techStack: ['Go 1.22', 'Gin', 'pgx', 'PostgreSQL', 'JWT', 'Docker'],
    features: [
      'Clean Architecture',
      'Middleware System',
      'Context Propagation',
      'Graceful Shutdown',
      'Health Checks',
      'Docker Multi-stage',
    ],
    files: [
      'go.mod',
      'cmd/server/main.go',
      'internal/handlers/*.go',
      'pkg/db/*.go',
      'docker-compose.yml',
      'Dockerfile',
    ],
  },
};

export async function infoCommand(templateName?: string) {
  if (!templateName) {
    console.error(chalk.red('Error: Template name is required'));
    console.log(chalk.gray('Usage: codescaffold info <template-name>'));
    console.log(chalk.gray('Available templates: ' + Object.keys(TEMPLATE_INFO).join(', ')));
    process.exit(1);
  }

  const info = TEMPLATE_INFO[templateName];

  if (!info) {
    console.error(chalk.red(`Error: Template "${templateName}" not found`));
    console.log(chalk.gray('\nAvailable templates:'));

    const templatesDir = path.join(__dirname, '../../templates');
    if (fs.existsSync(templatesDir)) {
      const templates = fs.readdirSync(templatesDir).filter(dir => {
        return fs.statSync(path.join(templatesDir, dir)).isDirectory();
      });
      console.log(chalk.cyan(templates.map(t => `  - ${t}`).join('\n')));
    }

    // Suggest similar templates if name is close
    const similar = findSimilarTemplates(templateName, Object.keys(TEMPLATE_INFO));
    if (similar.length > 0) {
      console.log(chalk.gray('\nDid you mean:'));
      console.log(chalk.cyan(similar.map(t => `  - ${t}`).join('\n')));
    }

    process.exit(1);
  }

  console.log();
  console.log(
    boxen(chalk.bold.cyan(info.name) + '\n\n' + chalk.white(info.description), {
      padding: 1,
      borderColor: 'cyan',
      borderStyle: 'round',
    })
  );

  console.log(chalk.bold('\nTech Stack:'));
  console.log(info.techStack.map(tech => chalk.cyan('  • ') + tech).join('\n'));

  console.log(chalk.bold('\nFeatures:'));
  console.log(info.features.map(feat => chalk.green('  ✓ ') + feat).join('\n'));

  console.log(chalk.bold('\nKey Files:'));
  console.log(info.files.map(file => chalk.gray('  • ') + file).join('\n'));

  console.log(chalk.bold('\nUsage:'));
  console.log(
    chalk.gray(
      `  codescaffold create my-${templateName.split('-')[0]}-project --template ${templateName}`
    )
  );

  console.log();
}

function findSimilarTemplates(input: string, templates: string[]): string[] {
  const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');

  return templates.filter(template => {
    const normalizedTemplate = template.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      normalizedTemplate.includes(normalizedInput) ||
      normalizedInput.includes(normalizedTemplate) ||
      levenshteinDistance(normalizedInput, normalizedTemplate) <= 3
    );
  });
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
