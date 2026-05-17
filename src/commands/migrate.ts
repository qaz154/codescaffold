import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { handleCLIError } from '../utils/errors';

interface MigrateOptions {
  source: string;
  target?: string;
  framework?: string;
  dry?: boolean;
}

interface MigrationResult {
  success: boolean;
  filesCopied: string[];
  filesSkipped: string[];
  errors: string[];
}

export async function migrateCommand(options: MigrateOptions): Promise<void> {
  try {
    console.log(chalk.cyan('\n🔄 项目迁移工具\n'));

    const sourcePath = path.resolve(options.source);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`源项目不存在: ${sourcePath}`);
    }

    // 检测源项目类型
    const sourceType = detectProjectType(sourcePath);
    console.log(chalk.gray(`源项目类型: ${sourceType || '未知'}`));

    // 选择目标框架
    const targetFramework = options.framework || (await selectTargetFramework(sourceType));

    // 执行迁移
    const result = await migrateProject(sourcePath, targetFramework, options);

    // 显示结果
    printMigrationResult(result);
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

function detectProjectType(projectPath: string): string | null {
  // 检查 Next.js
  if (
    fs.existsSync(path.join(projectPath, 'next.config.js')) ||
    fs.existsSync(path.join(projectPath, 'next.config.ts'))
  ) {
    return 'nextjs';
  }

  // 检查 Express
  if (fs.existsSync(path.join(projectPath, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
      if (pkg.dependencies?.express) {
        return 'express';
      }
    } catch {
      // ignore
    }
  }

  // 检查 Python
  if (
    fs.existsSync(path.join(projectPath, 'requirements.txt')) ||
    fs.existsSync(path.join(projectPath, 'pyproject.toml'))
  ) {
    return 'python';
  }

  // 检查 Go
  if (fs.existsSync(path.join(projectPath, 'go.mod'))) {
    return 'go';
  }

  return null;
}

async function selectTargetFramework(_sourceType: string | null): Promise<string> {
  const inquirer = await import('inquirer');

  const choices = [
    { name: 'Next.js (App Router)', value: 'nextjs-app' },
    { name: 'Next.js (Pages Router)', value: 'nextjs-pages' },
    { name: 'Express API', value: 'express-api' },
    { name: 'FastAPI', value: 'fastapi' },
    { name: 'Go Gin', value: 'go-gin' },
  ];

  const answer = await inquirer.default.prompt([
    {
      type: 'list',
      name: 'framework',
      message: '选择目标框架:',
      choices,
    },
  ]);

  return answer.framework;
}

async function migrateProject(
  sourcePath: string,
  targetFramework: string,
  options: MigrateOptions
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    filesCopied: [],
    filesSkipped: [],
    errors: [],
  };

  const targetPath = options.target
    ? path.resolve(options.target)
    : path.join(path.dirname(sourcePath), `${path.basename(sourcePath)}-migrated`);

  const spinner = ora({ text: chalk.cyan('迁移中...'), spinner: 'dots' }).start();

  try {
    // 复制源文件
    const filesToCopy = getFilesToCopy(sourcePath, targetFramework);

    for (const file of filesToCopy) {
      const srcFile = path.join(sourcePath, file);
      const destFile = path.join(targetPath, file);

      if (fs.existsSync(srcFile)) {
        const destDir = path.dirname(destFile);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        if (!options.dry) {
          fs.copyFileSync(srcFile, destFile);
        }

        result.filesCopied.push(file);
      } else {
        result.filesSkipped.push(file);
      }
    }

    // 生成配置文件
    if (!options.dry) {
      generateMigrationConfig(targetPath, targetFramework);
    }

    spinner.succeed(chalk.green('迁移完成'));
  } catch (error) {
    spinner.fail(chalk.red('迁移失败'));
    result.errors.push((error as Error).message);
    result.success = false;
  }

  return result;
}

function getFilesToCopy(sourcePath: string, targetFramework: string): string[] {
  const files: string[] = [];

  // 基础配置文件
  files.push('.gitignore');
  files.push('README.md');

  // 根据目标框架选择文件
  if (targetFramework.startsWith('nextjs')) {
    files.push('next.config.js');
    files.push('next.config.ts');
    files.push('tailwind.config.js');
    files.push('tailwind.config.ts');
    files.push('tsconfig.json');
  } else if (targetFramework === 'express-api') {
    files.push('tsconfig.json');
    files.push('.env.example');
  } else if (targetFramework === 'fastapi') {
    files.push('requirements.txt');
    files.push('pyproject.toml');
    files.push('.env.example');
  } else if (targetFramework === 'go-gin') {
    files.push('go.mod');
    files.push('go.sum');
  }

  return files;
}

function generateMigrationConfig(targetPath: string, framework: string): void {
  const packageJsonPath = path.join(targetPath, 'package.json');

  if (framework.startsWith('nextjs') || framework === 'express-api') {
    const packageJson = {
      name: path.basename(targetPath),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: framework.startsWith('nextjs') ? 'next dev' : 'tsx src/index.ts',
        build: framework.startsWith('nextjs') ? 'next build' : 'tsc',
        start: framework.startsWith('nextjs') ? 'next start' : 'node dist/index.js',
      },
      dependencies: {},
      devDependencies: {},
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

function printMigrationResult(result: MigrationResult): void {
  console.log(chalk.cyan('\n📋 迁移结果:\n'));

  if (result.filesCopied.length > 0) {
    console.log(chalk.green(`✓ 复制了 ${result.filesCopied.length} 个文件`));
    for (const file of result.filesCopied) {
      console.log(chalk.dim(`  ${file}`));
    }
  }

  if (result.filesSkipped.length > 0) {
    console.log(chalk.yellow(`⚠ 跳过了 ${result.filesSkipped.length} 个文件`));
    for (const file of result.filesSkipped) {
      console.log(chalk.dim(`  ${file}`));
    }
  }

  if (result.errors.length > 0) {
    console.log(chalk.red(`✗ 发生了 ${result.errors.length} 个错误`));
    for (const error of result.errors) {
      console.log(chalk.red(`  ${error}`));
    }
  }

  if (result.success) {
    console.log(chalk.green('\n✅ 迁移成功'));
  } else {
    console.log(chalk.red('\n❌ 迁移失败'));
  }
}
