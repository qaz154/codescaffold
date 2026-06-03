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

  checks.push(checkPackageJson(projectPath));
  checks.push(checkTsConfig(projectPath));
  checks.push(checkGitignore(projectPath));
  checks.push(checkReadme(projectPath));
  checks.push(checkEnvExample(projectPath));
  checks.push(checkDockerfile(projectPath));
  checks.push(checkTestFiles(projectPath));
  checks.push(checkCodeStyle(projectPath));

  const passed = checks.every(c => c.passed || c.severity !== 'error');
  const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100);

  return { passed, checks, score };
}

function checkPackageJson(projectPath: string): QualityCheck {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return {
      name: 'package.json',
      passed: false,
      message: 'Missing package.json',
      severity: 'error',
    };
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (!pkg.name || !pkg.version) {
      return {
        name: 'package.json',
        passed: false,
        message: 'package.json missing name or version',
        severity: 'warning',
      };
    }
    return { name: 'package.json', passed: true, message: 'package.json valid', severity: 'info' };
  } catch {
    return {
      name: 'package.json',
      passed: false,
      message: 'package.json has invalid JSON',
      severity: 'error',
    };
  }
}

function checkTsConfig(projectPath: string): QualityCheck {
  const tsConfigPath = path.join(projectPath, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    return {
      name: 'tsconfig.json',
      passed: false,
      message: 'Missing tsconfig.json',
      severity: 'warning',
    };
  }

  try {
    const content = fs.readFileSync(tsConfigPath, 'utf-8');
    JSON.parse(content);
    return {
      name: 'tsconfig.json',
      passed: true,
      message: 'tsconfig.json parseable',
      severity: 'info',
    };
  } catch {
    return {
      name: 'tsconfig.json',
      passed: false,
      message: 'tsconfig.json has invalid JSON',
      severity: 'error',
    };
  }
}

function checkGitignore(projectPath: string): QualityCheck {
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (content.includes('node_modules') && content.includes('.env')) {
      return {
        name: '.gitignore',
        passed: true,
        message: '.gitignore configured correctly',
        severity: 'info',
      };
    }
    return {
      name: '.gitignore',
      passed: false,
      message: '.gitignore missing important entries',
      severity: 'warning',
    };
  }
  return { name: '.gitignore', passed: false, message: 'Missing .gitignore', severity: 'error' };
}

function checkReadme(projectPath: string): QualityCheck {
  const readmePath = path.join(projectPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    if (content.length > 100) {
      return {
        name: 'README.md',
        passed: true,
        message: 'README.md has content',
        severity: 'info',
      };
    }
    return {
      name: 'README.md',
      passed: false,
      message: 'README.md content too short',
      severity: 'warning',
    };
  }
  return { name: 'README.md', passed: false, message: 'Missing README.md', severity: 'warning' };
}

function checkEnvExample(projectPath: string): QualityCheck {
  const envPath = path.join(projectPath, '.env.example');
  if (fs.existsSync(envPath)) {
    return {
      name: '.env.example',
      passed: true,
      message: '.env.example present',
      severity: 'info',
    };
  }
  return { name: '.env.example', passed: false, message: 'Missing .env.example', severity: 'info' };
}

function checkDockerfile(projectPath: string): QualityCheck {
  const dockerPath = path.join(projectPath, 'Dockerfile');
  if (fs.existsSync(dockerPath)) {
    return { name: 'Dockerfile', passed: true, message: 'Dockerfile present', severity: 'info' };
  }
  return { name: 'Dockerfile', passed: false, message: 'Missing Dockerfile', severity: 'info' };
}

function checkTestFiles(projectPath: string): QualityCheck {
  const hasTests =
    fs.existsSync(path.join(projectPath, 'tests')) ||
    fs.existsSync(path.join(projectPath, '__tests__')) ||
    fs.existsSync(path.join(projectPath, 'src', '__tests__'));

  if (hasTests) {
    return {
      name: 'Test files',
      passed: true,
      message: 'Test directory present',
      severity: 'info',
    };
  }
  return { name: 'Test files', passed: false, message: 'Missing test directory', severity: 'info' };
}

function checkCodeStyle(projectPath: string): QualityCheck {
  const hasPrettier =
    fs.existsSync(path.join(projectPath, '.prettierrc')) ||
    fs.existsSync(path.join(projectPath, '.prettierrc.json'));
  const hasEslint =
    fs.existsSync(path.join(projectPath, '.eslintrc')) ||
    fs.existsSync(path.join(projectPath, '.eslintrc.json')) ||
    fs.existsSync(path.join(projectPath, 'eslint.config.js'));

  if (hasPrettier || hasEslint) {
    return {
      name: 'Code style',
      passed: true,
      message: 'Code style config present',
      severity: 'info',
    };
  }
  return {
    name: 'Code style',
    passed: false,
    message: 'Missing code style config',
    severity: 'info',
  };
}

export function printQualityReport(report: QualityReport): void {
  console.log(chalk.cyan('\nQuality Report:\n'));

  for (const check of report.checks) {
    const icon = check.passed
      ? chalk.green('✓')
      : check.severity === 'error'
        ? chalk.red('✗')
        : chalk.yellow('⚠');
    const message = check.passed ? check.message : chalk.red(check.message);
    console.log(`  ${icon} ${check.name}: ${message}`);
  }

  console.log(
    `\n${chalk.bold('Score:')} ${report.score >= 80 ? chalk.green(report.score + '%') : chalk.yellow(report.score + '%')}`
  );

  if (report.passed) {
    console.log(chalk.green('\nQuality checks passed'));
  } else {
    console.log(chalk.red('\nQuality checks failed'));
  }
}
