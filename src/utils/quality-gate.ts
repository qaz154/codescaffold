import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface QualityCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface QualityReport {
  passed: boolean;
  checks: QualityCheck[];
  score: number;
}

export function runQualityChecks(projectPath: string): QualityReport {
  const checks: QualityCheck[] = [];

  // 检查 package.json
  checks.push(checkPackageJson(projectPath));

  // 检查 tsconfig.json
  checks.push(checkTsConfig(projectPath));

  // 检查 .gitignore
  checks.push(checkGitignore(projectPath));

  // 检查 README.md
  checks.push(checkReadme(projectPath));

  // 检查 .env.example
  checks.push(checkEnvExample(projectPath));

  // 检查 Dockerfile
  checks.push(checkDockerfile(projectPath));

  // 检查测试文件
  checks.push(checkTestFiles(projectPath));

  // 检查代码规范
  checks.push(checkCodeStyle(projectPath));

  const passed = checks.every((c) => c.passed || c.severity !== 'error');
  const score = Math.round(
    (checks.filter((c) => c.passed).length / checks.length) * 100
  );

  return { passed, checks, score };
}

function checkPackageJson(projectPath: string): QualityCheck {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { name: 'package.json', passed: false, message: '缺少 package.json', severity: 'error' };
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (!pkg.name || !pkg.version) {
      return { name: 'package.json', passed: false, message: 'package.json 缺少 name 或 version', severity: 'warning' };
    }
    return { name: 'package.json', passed: true, message: 'package.json 有效', severity: 'info' };
  } catch {
    return { name: 'package.json', passed: false, message: 'package.json 格式错误', severity: 'error' };
  }
}

function checkTsConfig(projectPath: string): QualityCheck {
  const tsConfigPath = path.join(projectPath, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    return { name: 'tsconfig.json', passed: true, message: 'tsconfig.json 存在', severity: 'info' };
  }
  return { name: 'tsconfig.json', passed: false, message: '缺少 tsconfig.json', severity: 'warning' };
}

function checkGitignore(projectPath: string): QualityCheck {
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('node_modules') && content.includes('.env')) {
      return { name: '.gitignore', passed: true, message: '.gitignore 配置正确', severity: 'info' };
    }
    return { name: '.gitignore', passed: false, message: '.gitignore 缺少重要配置', severity: 'warning' };
  }
  return { name: '.gitignore', passed: false, message: '缺少 .gitignore', severity: 'error' };
}

function checkReadme(projectPath: string): QualityCheck {
  const readmePath = path.join(projectPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    if (content.length > 100) {
      return { name: 'README.md', passed: true, message: 'README.md 内容充实', severity: 'info' };
    }
    return { name: 'README.md', passed: false, message: 'README.md 内容过少', severity: 'warning' };
  }
  return { name: 'README.md', passed: false, message: '缺少 README.md', severity: 'warning' };
}

function checkEnvExample(projectPath: string): QualityCheck {
  const envPath = path.join(projectPath, '.env.example');
  if (fs.existsSync(envPath)) {
    return { name: '.env.example', passed: true, message: '.env.example 存在', severity: 'info' };
  }
  return { name: '.env.example', passed: false, message: '缺少 .env.example', severity: 'info' };
}

function checkDockerfile(projectPath: string): QualityCheck {
  const dockerPath = path.join(projectPath, 'Dockerfile');
  if (fs.existsSync(dockerPath)) {
    return { name: 'Dockerfile', passed: true, message: 'Dockerfile 存在', severity: 'info' };
  }
  return { name: 'Dockerfile', passed: false, message: '缺少 Dockerfile', severity: 'info' };
}

function checkTestFiles(projectPath: string): QualityCheck {
  const hasTests = fs.existsSync(path.join(projectPath, 'tests')) ||
                   fs.existsSync(path.join(projectPath, '__tests__')) ||
                   fs.existsSync(path.join(projectPath, 'src', '__tests__'));

  if (hasTests) {
    return { name: '测试文件', passed: true, message: '测试目录存在', severity: 'info' };
  }
  return { name: '测试文件', passed: false, message: '缺少测试目录', severity: 'info' };
}

function checkCodeStyle(projectPath: string): QualityCheck {
  const hasPrettier = fs.existsSync(path.join(projectPath, '.prettierrc')) ||
                      fs.existsSync(path.join(projectPath, '.prettierrc.json'));
  const hasEslint = fs.existsSync(path.join(projectPath, '.eslintrc')) ||
                    fs.existsSync(path.join(projectPath, '.eslintrc.json')) ||
                    fs.existsSync(path.join(projectPath, 'eslint.config.js'));

  if (hasPrettier || hasEslint) {
    return { name: '代码规范', passed: true, message: '代码规范配置存在', severity: 'info' };
  }
  return { name: '代码规范', passed: false, message: '缺少代码规范配置', severity: 'info' };
}

export function printQualityReport(report: QualityReport): void {
  console.log(chalk.cyan('\n🔍 代码质量检查:\n'));

  for (const check of report.checks) {
    const icon = check.passed ? chalk.green('✓') : check.severity === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
    const message = check.passed ? check.message : chalk.red(check.message);
    console.log(`  ${icon} ${check.name}: ${message}`);
  }

  console.log(`\n${chalk.bold('质量评分:')} ${report.score >= 80 ? chalk.green(report.score + '%') : chalk.yellow(report.score + '%')}`);

  if (report.passed) {
    console.log(chalk.green('\n✅ 质量检查通过'));
  } else {
    console.log(chalk.red('\n❌ 质量检查未通过'));
  }
}
