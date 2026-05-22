import { ComponentCategory } from './types.js';

export const ui: ComponentCategory = {
  id: 'ui',
  name: 'UI 框架',
  description: '选择 UI 框架（可选）',
  required: false,
  options: [
    {
      id: 'tailwind-shadcn',
      name: 'Tailwind + shadcn/ui',
      description: '原子化 CSS + 现代组件库',
      dependencies: {
        tailwindcss: '^3.4.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        '@radix-ui/react-slot': '^1.1.0',
        'class-variance-authority': '^0.7.0',
        clsx: '^2.1.0',
        'tailwind-merge': '^2.5.0',
        'lucide-react': '^0.460.0',
      },
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      description: '原子化 CSS 框架',
      dependencies: {
        tailwindcss: '^3.4.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
      },
    },
    {
      id: 'mui',
      name: 'Material UI',
      description: 'Google Material Design 组件库',
      dependencies: {
        '@mui/material': '^6.0.0',
        '@emotion/react': '^11.13.0',
        '@emotion/styled': '^11.13.0',
      },
    },
    {
      id: 'antd',
      name: 'Ant Design',
      description: '企业级 UI 组件库',
      dependencies: {
        antd: '^5.22.0',
        '@ant-design/icons': '^5.5.0',
      },
    },
    {
      id: 'none',
      name: '无 UI',
      description: '不添加 UI 框架',
      dependencies: {},
    },
  ],
};
