import inquirer from 'inquirer';

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export const TEMPLATE_VARIANTS: Record<string, TemplateVariant[]> = {
  'nextjs-fullstack': [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard Next.js fullstack setup with basic configuration',
      features: ['next', 'react', 'typescript', 'prisma', 'tailwindcss'],
    },
    {
      id: 'with-auth',
      name: 'With Authentication',
      description: 'Includes complete auth system with JWT and user management',
      features: ['next', 'react', 'typescript', 'prisma', 'tailwindcss', 'auth', 'jwt'],
    },
    {
      id: 'with-graphql',
      name: 'With GraphQL',
      description: 'Next.js with GraphQL API using Apollo Server',
      features: ['next', 'react', 'typescript', 'prisma', 'tailwindcss', 'graphql', 'apollo'],
    },
  ],
  'express-api': [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard Express REST API with Prisma ORM',
      features: ['express', 'prisma', 'typescript', 'rest'],
    },
    {
      id: 'with-auth',
      name: 'With Authentication',
      description: 'Express API with complete JWT authentication',
      features: ['express', 'prisma', 'typescript', 'rest', 'auth', 'jwt', 'bcrypt'],
    },
    {
      id: 'microservice',
      name: 'Microservice',
      description: 'Express API configured for microservice architecture',
      features: ['express', 'prisma', 'typescript', 'rest', 'docker', 'rabbitmq'],
    },
  ],
  'python-fastapi': [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard FastAPI setup with SQLAlchemy',
      features: ['fastapi', 'sqlalchemy', 'python', 'rest'],
    },
    {
      id: 'with-auth',
      name: 'With Authentication',
      description: 'FastAPI with JWT authentication and user management',
      features: ['fastapi', 'sqlalchemy', 'python', 'rest', 'auth', 'jwt', 'bcrypt'],
    },
    {
      id: 'async',
      name: 'Async Heavy',
      description: 'FastAPI optimized for high-concurrency with async patterns',
      features: ['fastapi', 'sqlalchemy', 'python', 'rest', 'async', 'redis'],
    },
  ],
  'go-microservice': [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard Go Gin microservice with pgx',
      features: ['go', 'gin', 'pgx', 'rest'],
    },
    {
      id: 'with-auth',
      name: 'With Authentication',
      description: 'Go microservice with JWT middleware',
      features: ['go', 'gin', 'pgx', 'rest', 'auth', 'jwt'],
    },
    {
      id: 'grpc',
      name: 'gRPC Service',
      description: 'Go microservice with gRPC support',
      features: ['go', 'gin', 'pgx', 'rest', 'grpc', 'protobuf'],
    },
  ],
};

export async function selectVariant(
  template: string,
  options?: { defaultVariant?: string }
): Promise<string> {
  const variants = TEMPLATE_VARIANTS[template];

  if (!variants || variants.length <= 1) {
    return 'default';
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'variant',
      message: 'Select a template variant:',
      choices: variants.map((v) => ({
        name: `${v.name} - ${v.description}`,
        value: v.id,
      })),
      default: options?.defaultVariant || 'default',
    },
  ]);

  return answer.variant;
}

export function getVariantFeatures(template: string, variantId: string): string[] {
  const variants = TEMPLATE_VARIANTS[template];
  const variant = variants?.find((v) => v.id === variantId);
  return variant?.features || [];
}
