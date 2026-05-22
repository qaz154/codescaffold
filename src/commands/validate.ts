import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { handleCLIError } from '../utils/errors.js';

interface ValidationResult {
  passed: boolean;
  checks: CheckResult[];
}

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const TEMPLATE_FILES: Record<string, string[]> = {
  'express-api': [
    'package.json',
    'tsconfig.json',
    'src/server.ts',
    'src/controllers',
    'src/routes',
    'src/middleware',
    'Dockerfile',
  ],
  'nextjs-fullstack': ['package.json', 'next.config.ts', 'app', 'lib', 'prisma', 'Dockerfile'],
  'python-fastapi': ['requirements.txt', 'pyproject.toml', 'app', 'tests', 'Dockerfile'],
  'go-microservice': ['go.mod', 'go.sum', 'cmd', 'internal', 'Dockerfile'],
};

function detectTemplate(projectDir: string): string | null {
  if (
    fs.existsSync(path.join(projectDir, 'next.config.ts')) ||
    fs.existsSync(path.join(projectDir, 'next.config.js'))
  ) {
    return 'nextjs-fullstack';
  }

  if (
    fs.existsSync(path.join(projectDir, 'requirements.txt')) &&
    fs.existsSync(path.join(projectDir, 'pyproject.toml'))
  ) {
    return 'python-fastapi';
  }

  if (fs.existsSync(path.join(projectDir, 'go.mod'))) {
    return 'go-microservice';
  }

  if (
    fs.existsSync(path.join(projectDir, 'tsconfig.json')) &&
    fs.existsSync(path.join(projectDir, 'package.json'))
  ) {
    return 'express-api';
  }

  return null;
}

async function runChecks(projectDir: string, template: string): Promise<ValidationResult> {
  const checks: CheckResult[] = [];

  const requiredFiles = TEMPLATE_FILES[template] || [];

  for (const file of requiredFiles) {
    const filePath = path.join(projectDir, file);
    const exists = fs.existsSync(filePath);

    checks.push({
      name: `Has ${file}`,
      passed: exists,
      message: exists ? `Found ${file}` : `Missing ${file}`,
    });
  }

  if (template === 'express-api' || template === 'nextjs-fullstack') {
    const pkgPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        checks.push({
          name: 'Package.json valid',
          passed: pkg.name && pkg.version,
          message: pkg.name ? 'Valid package.json' : 'Invalid package.json',
        });

        const hasDependencies = Object.keys(pkg.dependencies || {}).length > 0;
        checks.push({
          name: 'Has dependencies',
          passed: hasDependencies,
          message: hasDependencies ? 'Dependencies defined' : 'No dependencies defined',
        });
      } catch {
        checks.push({
          name: 'Package.json parseable',
          passed: false,
          message: 'Failed to parse package.json',
        });
      }
    }
  }

  if (template === 'python-fastapi') {
    const reqPath = path.join(projectDir, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      const content = fs.readFileSync(reqPath, 'utf-8');
      const hasDeps = content.trim().length > 0;

      checks.push({
        name: 'Requirements.txt has dependencies',
        passed: hasDeps,
        message: hasDeps ? 'Dependencies defined' : 'No dependencies in requirements.txt',
      });
    }
  }

  if (template === 'go-microservice') {
    const goModPath = path.join(projectDir, 'go.mod');
    if (fs.existsSync(goModPath)) {
      const content = fs.readFileSync(goModPath, 'utf-8');
      const hasModule = content.includes('module ');

      checks.push({
        name: 'Go module defined',
        passed: hasModule,
        message: hasModule ? 'Module defined in go.mod' : 'No module in go.mod',
      });
    }
  }

  const dockerPath = path.join(projectDir, 'Dockerfile');
  checks.push({
    name: 'Dockerfile exists',
    passed: fs.existsSync(dockerPath),
    message: fs.existsSync(dockerPath) ? 'Dockerfile found' : 'No Dockerfile',
  });

  const readmePath = path.join(projectDir, 'README.md');
  checks.push({
    name: 'README exists',
    passed: fs.existsSync(readmePath),
    message: fs.existsSync(readmePath) ? 'README.md found' : 'No README.md',
  });

  const gitPath = path.join(projectDir, '.gitignore');
  checks.push({
    name: '.gitignore exists',
    passed: fs.existsSync(gitPath),
    message: fs.existsSync(gitPath) ? '.gitignore found' : 'No .gitignore',
  });

  const hasHardcodedSecrets = await checkForHardcodedSecrets(projectDir);
  checks.push({
    name: 'No hardcoded secrets',
    passed: !hasHardcodedSecrets,
    message: hasHardcodedSecrets
      ? 'WARNING: Potential hardcoded secrets found'
      : 'No hardcoded secrets detected',
  });

  const allPassed = checks.every(c => c.passed);
  return { passed: allPassed, checks };
}

async function checkForHardcodedSecrets(projectDir: string): Promise<boolean> {
  const secretPatterns = [
    /(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
    /(?:sk-|pk-)[a-zA-Z0-9]{20,}/,
    /(?:AKIA|ASIA)[A-Z0-9]{16}/,
  ];

  const codeExtensions = ['.ts', '.js', '.py', '.go', '.env'];
  const filesToCheck: string[] = [];

  function scanDir(dir: string, depth: number = 0): void {
    if (depth > 3) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'vendor') {
          continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else if (codeExtensions.some(ext => entry.name.endsWith(ext))) {
          filesToCheck.push(fullPath);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  scanDir(projectDir);

  for (const file of filesToCheck.slice(0, 50)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');

      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          return true;
        }
      }
    } catch {
      // Skip files we can't read
    }
  }

  return false;
}

export async function validateCommand(options: { directory?: string }): Promise<void> {
  try {
    const projectDir = path.resolve(options.directory || '.');
    const spinner = ora({ text: chalk.cyan('Validating project...'), spinner: 'dots' }).start();

    if (!fs.existsSync(projectDir)) {
      spinner.fail(chalk.red(`Directory not found: ${projectDir}`));
      process.exit(1);
    }

    const template = detectTemplate(projectDir);

    if (!template) {
      spinner.fail(chalk.red('Could not detect project template'));
      console.log(chalk.gray('\nExpected project structure not found.'));
      console.log(chalk.gray('Make sure you are in a CodeScaffold-generated project directory.\n'));
      process.exit(1);
    }

    spinner.text = chalk.cyan(`Detected template: ${template}`);

    const result = await runChecks(projectDir, template);

    spinner.stop();
    console.log(chalk.cyan('\n📋 Validation Results:\n'));

    for (const check of result.checks) {
      const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${check.name}`);
      if (!check.passed) {
        console.log(chalk.red(`    → ${check.message}`));
      }
    }

    console.log();

    const passedCount = result.checks.filter(c => c.passed).length;
    const totalCount = result.checks.length;

    if (result.passed) {
      console.log(chalk.green(`✅ All checks passed (${passedCount}/${totalCount})`));
    } else {
      console.log(chalk.yellow(`⚠️  Some checks failed (${passedCount}/${totalCount})`));
      console.log(chalk.gray('\nRun with --verbose for more details.'));
    }

    console.log();
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

export async function quickValidate(projectDir: string): Promise<boolean> {
  const template = detectTemplate(projectDir);

  if (!template) {
    return false;
  }

  const requiredFiles = TEMPLATE_FILES[template] || [];
  return requiredFiles.every(file => fs.existsSync(path.join(projectDir, file)));
}
