import chalk from 'chalk';
import inquirer from 'inquirer';
import { handleCLIError } from '../utils/errors';
import { generateWithAI } from '../generator';

interface Preset {
  name: string;
  description: string;
  template: string;
  requirement: string;
  features: string[];
}

const PRESETS: Preset[] = [
  {
    name: 'REST API',
    description: 'Express API with authentication, CRUD operations, and PostgreSQL',
    template: 'express-api',
    requirement:
      'A RESTful API with user authentication (register, login, profile), role-based access control, CRUD operations for resources, input validation, error handling, and PostgreSQL database',
    features: ['auth', 'crud', 'validation', 'postgresql'],
  },
  {
    name: 'Next.js SaaS',
    description: 'Full-stack SaaS application with auth, dashboard, and Stripe',
    template: 'nextjs-fullstack',
    requirement:
      'A SaaS application with user authentication, admin dashboard, subscription management with Stripe, user profiles, and real-time notifications',
    features: ['auth', 'dashboard', 'payment', 'notifications'],
  },
  {
    name: 'FastAPI ML Backend',
    description: 'Python backend for ML model serving with async and WebSocket',
    template: 'python-fastapi',
    requirement:
      'A machine learning model serving API with async processing, WebSocket for real-time predictions, batch prediction endpoints, model versioning, and monitoring',
    features: ['ml-serving', 'websocket', 'async', 'monitoring'],
  },
  {
    name: 'Go Microservice',
    description: 'Go service with gRPC, Kubernetes health probes, and logging',
    template: 'go-microservice',
    requirement:
      'A Go microservice with structured logging, Kubernetes health probes (liveness, readiness), graceful shutdown, gRPC support, and Prometheus metrics',
    features: ['logging', 'health-checks', 'grpc', 'metrics'],
  },
  {
    name: 'Admin Panel',
    description: 'Admin dashboard with user management, analytics, and CRUD',
    template: 'nextjs-fullstack',
    requirement:
      'An admin panel with user management (CRUD, roles, permissions), data analytics dashboard with charts, audit logging, and bulk operations',
    features: ['admin', 'auth', 'crud', 'analytics'],
  },
  {
    name: 'E-commerce API',
    description: 'E-commerce backend with products, orders, and payments',
    template: 'express-api',
    requirement:
      'An e-commerce API with product catalog, shopping cart, order management, payment processing with Stripe, inventory tracking, and order notifications',
    features: ['crud', 'payment', 'notifications', 'inventory'],
  },
];

export async function presetsCommand(): Promise<void> {
  try {
    console.log(chalk.cyan('\n🎯 Project Presets\n'));
    console.log(chalk.gray('Quick-start templates for common project types\n'));

    const { preset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Select a preset:',
        choices: PRESETS.map(p => ({
          name: `${chalk.bold(p.name)} - ${chalk.gray(p.description)}`,
          value: p,
        })),
      },
    ]);

    const { projectName, outputDir, customize } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: preset.name.toLowerCase().replace(/\s+/g, '-'),
        validate: (input: string) => {
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name should only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Output directory:',
        default: '.',
      },
      {
        type: 'confirm',
        name: 'customize',
        message: 'Customize the requirement before generating?',
        default: false,
      },
    ]);

    let requirement = preset.requirement;

    if (customize) {
      const { customRequirement } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'customRequirement',
          message: 'Edit the requirement:',
          default: preset.requirement,
        },
      ]);
      requirement = customRequirement;
    }

    console.log(chalk.cyan('\n🤖 Generating project with AI...\n'));
    console.log(chalk.dim(`Template: ${preset.template}`));
    console.log(chalk.dim(`Features: ${preset.features.join(', ')}\n`));

    await generateWithAI({
      requirement,
      output: outputDir,
      force: false,
    });

    console.log(chalk.green('\n🎉 Project generated successfully!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));

    if (preset.template === 'python-fastapi') {
      console.log(chalk.gray('  python -m venv venv'));
      console.log(
        chalk.gray('  source venv/bin/activate  # or venv\\Scripts\\activate on Windows')
      );
      console.log(chalk.gray('  pip install -r requirements.txt'));
      console.log(chalk.gray('  uvicorn app.main:app --reload'));
    } else if (preset.template === 'go-microservice') {
      console.log(chalk.gray('  go mod tidy'));
      console.log(chalk.gray('  go run cmd/server/main.go'));
    } else {
      console.log(chalk.gray('  npm install'));
      console.log(chalk.gray('  npm run dev'));
    }
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

export function listPresets(): void {
  console.log(chalk.cyan('\n🎯 Available Presets:\n'));

  for (const preset of PRESETS) {
    console.log(chalk.bold(`  ${preset.name}`));
    console.log(chalk.gray(`    ${preset.description}`));
    console.log(
      chalk.dim(`    Template: ${preset.template} | Features: ${preset.features.join(', ')}`)
    );
    console.log();
  }
}
