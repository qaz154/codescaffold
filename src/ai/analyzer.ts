export interface AnalysisResult {
  projectType: 'nextjs-fullstack' | 'express-api' | 'python-fastapi' | 'go-microservice';
  features: string[];
  database: 'postgresql' | 'mysql' | 'sqlite';
  auth: boolean;
  api: boolean;
  ui: boolean;
  docker: boolean;
  ci: boolean;
}

const KEYWORD_PATTERNS = {
  projectType: {
    'nextjs-fullstack': [
      'nextjs',
      'next.js',
      'react',
      '前端',
      'fullstack',
      'full-stack',
      'full stack',
      '前后端',
    ],
    'express-api': ['express', 'rest api', 'restapi', 'backend', '后端'],
    'python-fastapi': ['python fastapi', 'fastapi', 'django', 'flask', 'python'],
    'go-microservice': ['golang', 'go microservice', '微服务', 'grpc', 'go '],
  },
  features: {
    auth: [
      'auth',
      '登录',
      '注册',
      'login',
      'register',
      'jwt',
      'passport',
      'oauth',
      '权限',
      'permission',
    ],
    crud: ['crud', '增删改查', 'create', 'read', 'update', 'delete', 'user management', '用户管理'],
    websocket: ['websocket', '实时', 'real-time', 'socket'],
    file: ['file', 'upload', '上传', 'download', 's3', 'storage'],
    email: ['email', '邮件', 'mail', 'smtp', 'sendgrid'],
    payment: ['payment', '支付', 'stripe', 'paypal'],
    admin: ['admin', '管理后台', 'dashboard'],
  },
  database: {
    postgresql: ['postgres', 'postgresql', 'pg', 'pgvector'],
    mysql: ['mysql', 'mariadb'],
    sqlite: ['sqlite', 'sqlite3'],
  },
};

import { detectKeyword } from '../utils/keyword.js';

export function analyzeRequirements(requirement: string): AnalysisResult {
  const result: AnalysisResult = {
    projectType: 'express-api',
    features: [],
    database: 'postgresql',
    auth: false,
    api: true,
    ui: false,
    docker: true,
    ci: true,
  };

  // Detect project type
  for (const [type, patterns] of Object.entries(KEYWORD_PATTERNS.projectType)) {
    if (detectKeyword(requirement, patterns)) {
      result.projectType = type as AnalysisResult['projectType'];
      break;
    }
  }

  // Detect features
  for (const [feature, patterns] of Object.entries(KEYWORD_PATTERNS.features)) {
    if (detectKeyword(requirement, patterns)) {
      result.features.push(feature);
      if (feature === 'auth') result.auth = true;
    }
  }

  // Detect UI requirement
  if (detectKeyword(requirement, ['ui', '界面', 'frontend', '页面', 'web app'])) {
    result.ui = true;
  }

  // Detect database type
  for (const [db, patterns] of Object.entries(KEYWORD_PATTERNS.database)) {
    if (detectKeyword(requirement, patterns)) {
      result.database = db as AnalysisResult['database'];
      break;
    }
  }

  // Default features based on project type
  if (result.projectType === 'nextjs-fullstack') {
    result.ui = true;
  }

  if (result.features.length === 0) {
    result.features.push('basic-crud');
  }

  return result;
}

export function formatAnalysisReport(result: AnalysisResult): string {
  const lines: string[] = [
    '## Analysis Report',
    '',
    `**Project Type**: ${result.projectType}`,
    `**Database**: ${result.database}`,
    `**Features**: ${result.features.join(', ') || 'basic-crud'}`,
    `**Auth**: ${result.auth ? 'Yes' : 'No'}`,
    `**UI**: ${result.ui ? 'Yes' : 'No'}`,
    `**Docker**: ${result.docker ? 'Yes' : 'No'}`,
    `**CI/CD**: ${result.ci ? 'Yes' : 'No'}`,
  ];

  return lines.join('\n');
}
