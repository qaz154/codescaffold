import fs from 'fs';
import path from 'path';

export interface FastGenerateOptions {
  name: string;
  framework: string;
  database: string;
  auth: string;
  ui: string;
  output: string;
}

export async function fastGenerate(options: FastGenerateOptions): Promise<string> {
  const projectPath = path.join(options.output, options.name);

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }

  const packageJson = generatePackageJson(options);
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  const tsConfig = generateTsConfig(options);
  fs.writeFileSync(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  fs.writeFileSync(
    path.join(projectPath, '.gitignore'),
    generateGitignore()
  );

  fs.writeFileSync(
    path.join(projectPath, 'README.md'),
    generateReadme(options)
  );

  generateStructure(projectPath, options);

  return projectPath;
}

function generatePackageJson(options: FastGenerateOptions) {
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  // 框架
  if (options.framework.startsWith('nextjs')) {
    deps['next'] = '^15.0.0';
    deps['react'] = '^18.3.0';
    deps['react-dom'] = '^18.3.0';
    devDeps['@types/node'] = '^22.0.0';
    devDeps['@types/react'] = '^18.3.0';
    devDeps['@types/react-dom'] = '^18.3.0';
    devDeps['typescript'] = '^5.6.0';
  } else if (options.framework === 'express-api') {
    deps['express'] = '^4.21.0';
    deps['cors'] = '^2.8.5';
    deps['helmet'] = '^8.0.0';
    deps['dotenv'] = '^16.4.0';
    devDeps['@types/node'] = '^22.0.0';
    devDeps['@types/express'] = '^4.17.21';
    devDeps['typescript'] = '^5.6.0';
    devDeps['tsx'] = '^4.19.0';
  }

  // 数据库
  if (options.database.startsWith('prisma')) {
    deps['@prisma/client'] = '^5.22.0';
    devDeps['prisma'] = '^5.22.0';
  } else if (options.database.startsWith('drizzle')) {
    deps['drizzle-orm'] = '^0.36.0';
    devDeps['drizzle-kit'] = '^0.28.0';
  }

  // 认证
  if (options.auth === 'nextauth') {
    deps['next-auth'] = '^4.24.0';
  } else if (options.auth === 'jwt') {
    deps['jsonwebtoken'] = '^9.0.2';
    deps['bcryptjs'] = '^2.4.3';
  }

  // UI
  if (options.ui.startsWith('tailwind')) {
    deps['tailwindcss'] = '^3.4.0';
    devDeps['postcss'] = '^8.4.0';
    devDeps['autoprefixer'] = '^10.4.0';
  }

  return {
    name: options.name,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: options.framework.startsWith('nextjs') ? 'next dev' : 'tsx src/index.ts',
      build: options.framework.startsWith('nextjs') ? 'next build' : 'tsc',
      start: options.framework.startsWith('nextjs') ? 'next start' : 'node dist/index.js',
    },
    dependencies: deps,
    devDependencies: devDeps,
  };
}

function generateTsConfig(options: FastGenerateOptions) {
  if (options.framework.startsWith('nextjs')) {
    return {
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };
  }

  return {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
}

function generateGitignore(): string {
  return `node_modules/
dist/
.next/
.env
.env.local
*.log
.DS_Store
`;
}

function generateReadme(options: FastGenerateOptions): string {
  return `# ${options.name}

使用 CodeScaffold 创建

## 技术栈

- 框架: ${options.framework}
- 数据库: ${options.database}
- 认证: ${options.auth}
- UI: ${options.ui}

## 开始

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
}

function generateStructure(projectPath: string, options: FastGenerateOptions): void {
  const srcDir = path.join(projectPath, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  if (options.framework.startsWith('nextjs')) {
    const appDir = path.join(projectPath, 'app');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(appDir, 'layout.tsx'),
      `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
    );

    fs.writeFileSync(
      path.join(appDir, 'page.tsx'),
      `export default function Home() {
  return <main><h1>Welcome</h1></main>;
}
`
    );
  } else {
    fs.writeFileSync(
      path.join(srcDir, 'index.ts'),
      `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
    );
  }
}
