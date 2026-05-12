import { ComponentCategory } from './types';

export const deploy: ComponentCategory = {
  id: 'deploy',
  name: '部署平台',
  description: '选择部署平台（可选）',
  required: false,
  options: [
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Next.js 官方部署平台',
      dependencies: {},
      configFiles: {
        'vercel.json': JSON.stringify({
          version: 2,
          builds: [{ src: 'package.json', use: '@vercel/node' }],
        }, null, 2),
      },
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: '静态站点部署平台',
      dependencies: {},
      configFiles: {
        'netlify.toml': `[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"
`,
      },
    },
    {
      id: 'fly',
      name: 'Fly.io',
      description: '容器化部署平台',
      dependencies: {},
      configFiles: {
        'fly.toml': `app = "my-app"

[build]

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
`,
      },
    },
    {
      id: 'docker',
      name: 'Docker',
      description: '容器化部署',
      dependencies: {},
      configFiles: {
        'Dockerfile': `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
`,
        'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`,
      },
    },
    {
      id: 'none',
      name: '无部署配置',
      description: '不添加部署配置',
      dependencies: {},
    },
  ],
};
