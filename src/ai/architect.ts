import { AnalysisResult } from './analyzer';

export interface ArchitectureRecommendation {
  techStack: {
    frontend?: string;
    backend: string;
    database: string;
    orm?: string;
    testing: string[];
    deployment: string[];
  };
  directoryStructure: string[];
  dependencies: {
    production: string[];
    development: string[];
  };
  dockerConfig: {
    baseImage: string;
    port: number;
    healthCheck: string;
  };
}

const TECH_STACK_RECOMMENDATIONS: Record<string, ArchitectureRecommendation> = {
  'nextjs-fullstack': {
    techStack: {
      frontend: 'Next.js 15 (App Router)',
      backend: 'Express.js',
      database: 'PostgreSQL',
      orm: 'Prisma',
      testing: ['Vitest', 'Playwright'],
      deployment: ['Docker', 'Docker Compose', 'Vercel', 'GitHub Actions'],
    },
    directoryStructure: [
      'app/                    # Next.js App Router',
      '├── api/               # API routes',
      '├── layout.tsx         # Root layout',
      '├── page.tsx           # Home page',
      'components/            # React components',
      'lib/                   # Utilities',
      '│   └── db.ts         # Prisma client',
      'prisma/',
      '│   └── schema.prisma # Database schema',
      'src/                   # Express backend',
      '├── routes/',
      '├── controllers/',
      '└── middleware/',
      'tests/                 # Test files',
      'docker-compose.yml',
      'Dockerfile',
    ],
    dependencies: {
      production: ['next', 'react', 'react-dom', 'express', 'cors', '@prisma/client'],
      development: ['typescript', 'prisma', 'vitest', '@playwright/test', 'tailwindcss'],
    },
    dockerConfig: {
      baseImage: 'node:22-alpine',
      port: 3000,
      healthCheck: 'curl -f http://localhost:3000/health || exit 1',
    },
  },
  'express-api': {
    techStack: {
      backend: 'Express.js',
      database: 'PostgreSQL',
      orm: 'Prisma',
      testing: ['Vitest', 'Supertest'],
      deployment: ['Docker', 'Docker Compose', 'GitHub Actions'],
    },
    directoryStructure: [
      'src/',
      '├── routes/           # Route handlers',
      '├── controllers/      # Business logic',
      '├── models/          # Data models',
      '├── middleware/      # Express middleware',
      '└── config/          # Configuration',
      'prisma/',
      '│   └── schema.prisma',
      'tests/',
      'docker-compose.yml',
      'Dockerfile',
    ],
    dependencies: {
      production: ['express', 'cors', 'dotenv', '@prisma/client'],
      development: ['typescript', 'prisma', 'vitest', 'tsx', 'eslint'],
    },
    dockerConfig: {
      baseImage: 'node:22-alpine',
      port: 8080,
      healthCheck: 'wget -qO- http://localhost:8080/health || exit 1',
    },
  },
  'python-fastapi': {
    techStack: {
      backend: 'FastAPI',
      database: 'PostgreSQL',
      orm: 'SQLAlchemy',
      testing: ['Pytest', 'httpx'],
      deployment: ['Docker', 'Docker Compose', 'GitHub Actions'],
    },
    directoryStructure: [
      'app/',
      '├── main.py          # FastAPI app',
      '├── models.py        # SQLAlchemy models',
      '├── schemas.py       # Pydantic schemas',
      '├── routers/         # API routers',
      '│   └── users.py',
      '└── config.py        # Settings',
      'pkg/',
      '│   └── db.py       # Database connection',
      'alembic/            # Migrations',
      'tests/',
      'docker-compose.yml',
      'Dockerfile',
    ],
    dependencies: {
      production: ['fastapi', 'uvicorn', 'sqlalchemy', 'alembic', 'pydantic', 'python-jose', 'passlib'],
      development: ['pytest', 'pytest-asyncio', 'httpx', 'ruff'],
    },
    dockerConfig: {
      baseImage: 'python:3.11-slim',
      port: 8000,
      healthCheck: 'curl -f http://localhost:8000/health || exit 1',
    },
  },
  'go-microservice': {
    techStack: {
      backend: 'Go 1.22 + Gin',
      database: 'PostgreSQL',
      orm: 'pgx',
      testing: ['Go testing', 'testify'],
      deployment: ['Docker', 'Docker Compose', 'GitHub Actions'],
    },
    directoryStructure: [
      'cmd/server/          # Entry point',
      '├── main.go',
      'internal/',
      '├── handlers/        # HTTP handlers',
      '├── models/          # Data models',
      '└── middleware/      # Gin middleware',
      'pkg/db/              # Database layer',
      'migrations/          # SQL migrations',
      'docker-compose.yml',
      'Dockerfile',
    ],
    dependencies: {
      production: ['gin-gonic/gin', 'jackc/pgx', 'google/uuid', 'joho/godotenv'],
      development: ['golang.org/x/crypto', 'github.com/testify'],
    },
    dockerConfig: {
      baseImage: 'golang:1.22-alpine',
      port: 8080,
      healthCheck: 'wget -qO- http://localhost:8080/health || exit 1',
    },
  },
};

export function recommendArchitecture(analysis: AnalysisResult): ArchitectureRecommendation {
  const recommendation = TECH_STACK_RECOMMENDATIONS[analysis.projectType];

  // Adjust for database preference
  const dbRecommendation = { ...recommendation };
  if (analysis.database === 'mysql') {
    dbRecommendation.techStack.database = 'MySQL';
  } else if (analysis.database === 'sqlite') {
    dbRecommendation.techStack.database = 'SQLite';
  }

  return dbRecommendation;
}

export function formatArchitectureReport(recommendation: ArchitectureRecommendation): string {
  const lines: string[] = [
    '## Architecture Recommendation',
    '',
    '### Tech Stack',
  ];

  for (const [key, value] of Object.entries(recommendation.techStack)) {
    if (value) {
      lines.push(`- **${key}**: ${Array.isArray(value) ? value.join(', ') : value}`);
    }
  }

  lines.push('', '### Directory Structure', '```');
  lines.push(...recommendation.directoryStructure);
  lines.push('```');

  lines.push('', '### Dependencies');
  lines.push('**Production**:');
  lines.push(...recommendation.dependencies.production.map((d) => `- ${d}`));
  lines.push('**Development**:');
  lines.push(...recommendation.dependencies.development.map((d) => `- ${d}`));

  lines.push('', '### Docker');
  lines.push(`- Base Image: ${recommendation.dockerConfig.baseImage}`);
  lines.push(`- Port: ${recommendation.dockerConfig.port}`);
  lines.push(`- Health Check: ${recommendation.dockerConfig.healthCheck}`);

  return lines.join('\n');
}
