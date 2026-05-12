import { ComponentCategory } from './types';

export const auth: ComponentCategory = {
  id: 'auth',
  name: '认证',
  description: '选择认证方式（可选）',
  required: false,
  options: [
    {
      id: 'nextauth',
      name: 'NextAuth.js',
      description: 'Next.js 官方认证库',
      dependencies: {
        'next-auth': '^4.24.0',
      },
    },
    {
      id: 'jwt',
      name: 'JWT 自定义',
      description: '基于 jsonwebtoken 的自定义认证',
      dependencies: {
        'jsonwebtoken': '^9.0.2',
        'bcryptjs': '^2.4.3',
      },
      devDependencies: {
        '@types/jsonwebtoken': '^9.0.7',
        '@types/bcryptjs': '^2.4.6',
      },
    },
    {
      id: 'clerk',
      name: 'Clerk',
      description: '现代化用户管理平台',
      dependencies: {
        '@clerk/nextjs': '^5.0.0',
      },
    },
    {
      id: 'none',
      name: '无认证',
      description: '不添加认证功能',
      dependencies: {},
    },
  ],
};
