import { ComponentCategory } from './types.js';

export const frameworks: ComponentCategory = {
  id: 'framework',
  name: '框架',
  description: '选择项目框架',
  required: true,
  options: [
    {
      id: 'nextjs-app',
      name: 'Next.js (App Router)',
      description: 'React 全栈框架，支持 App Router',
      dependencies: {
        next: '^15.0.0',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        typescript: '^5.6.0',
      },
    },
    {
      id: 'nextjs-pages',
      name: 'Next.js (Pages Router)',
      description: 'React 全栈框架，传统 Pages Router',
      dependencies: {
        next: '^15.0.0',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        '@types/react': '^18.3.0',
        '@types/react-dom': '^18.3.0',
        typescript: '^5.6.0',
      },
    },
    {
      id: 'express-api',
      name: 'Express API',
      description: 'Node.js REST API 框架',
      dependencies: {
        express: '^4.21.0',
        cors: '^2.8.5',
        helmet: '^8.0.0',
        dotenv: '^16.4.0',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        '@types/express': '^4.17.21',
        typescript: '^5.6.0',
        tsx: '^4.19.0',
      },
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      description: 'Python 高性能异步 API 框架',
      dependencies: {
        fastapi: '^0.115.0',
        'uvicorn[standard]': '^0.32.0',
        pydantic: '^2.10.0',
      },
    },
    {
      id: 'go-gin',
      name: 'Go Gin',
      description: 'Go 高性能 HTTP 框架',
      dependencies: {
        'github.com/gin-gonic/gin': '^1.10.0',
      },
    },
  ],
};
