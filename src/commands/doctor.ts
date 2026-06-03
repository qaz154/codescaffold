import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { handleCLIError } from '../utils/errors.js';
import { runQualityChecks, printQualityReport } from '../utils/quality-gate.js';

interface DoctorOptions {
  directory?: string;
  fix?: boolean;
}

interface HealthIssue {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  fix?: string;
  autoFixable: boolean;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  try {
    const projectDir = path.resolve(options.directory || '.');
    console.log(chalk.cyan('\nCodeScaffold Doctor\n'));
    console.log(chalk.gray(`Scanning: ${projectDir}\n`));

    if (!fs.existsSync(projectDir)) {
      console.error(chalk.red(`Directory not found: ${projectDir}`));
      process.exit(1);
    }

    const issues: HealthIssue[] = [];

    // 1. Package.json health
    issues.push(...checkPackageHealth(projectDir));

    // 2. Security audit
    issues.push(...checkSecurity(projectDir));

    // 3. Config validation
    issues.push(...checkConfigs(projectDir));

    // 4. Template drift
    issues.push(...checkTemplateDrift(projectDir));

    // 5. Environment
    issues.push(...checkEnvironment(projectDir));

    // 6. Quality gate
    const qualityReport = runQualityChecks(projectDir);

    // Display results
    displayResults(issues, qualityReport);

    // Auto-fix if requested
    if (options.fix) {
      await autoFix(projectDir, issues);
    }

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (criticalCount > 0) {
      console.log(
        chalk.red(`\n${criticalCount} critical issue(s) found. Run with --fix to auto-repair.\n`)
      );
      process.exit(1);
    } else if (warningCount > 0) {
      console.log(chalk.yellow(`\n${warningCount} warning(s) found.\n`));
    } else {
      console.log(chalk.green('\nProject looks healthy!\n'));
    }
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

function checkPackageHealth(projectDir: string): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const pkgPath = path.join(projectDir, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return issues;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    // Check for missing fields
    if (!pkg.engines) {
      issues.push({
        category: 'Package',
        severity: 'info',
        message: 'Missing "engines" field - specify Node.js version requirements',
        fix: 'Add "engines": { "node": ">=18" } to package.json',
        autoFixable: false,
      });
    }

    if (!pkg.repository && !pkg.private) {
      issues.push({
        category: 'Package',
        severity: 'info',
        message: 'Missing "repository" field for public package',
        autoFixable: false,
      });
    }

    // Check for outdated deps
    try {
      const outdated = execSync('npm outdated --json', {
        cwd: projectDir,
        encoding: 'utf-8',
        timeout: 30000,
      });
      const outdatedPkgs = JSON.parse(outdated);
      const count = Object.keys(outdatedPkgs).length;
      if (count > 0) {
        issues.push({
          category: 'Dependencies',
          severity: count > 5 ? 'warning' : 'info',
          message: `${count} outdated dependency(ies)`,
          fix: 'Run "npm update" to update dependencies',
          autoFixable: true,
        });
      }
    } catch {
      // npm outdated exits non-zero when there are outdated packages
    }
  } catch {
    issues.push({
      category: 'Package',
      severity: 'critical',
      message: 'package.json has invalid JSON',
      autoFixable: false,
    });
  }

  return issues;
}

function checkSecurity(projectDir: string): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Check for .env file committed
  const envPath = path.join(projectDir, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const gitignorePath = path.join(projectDir, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        if (!gitignore.includes('.env')) {
          issues.push({
            category: 'Security',
            severity: 'critical',
            message: '.env file exists but not in .gitignore',
            fix: 'Add ".env" to .gitignore',
            autoFixable: true,
          });
        }
      }
    } catch {
      // Skip
    }
  }

  // Check for hardcoded secrets in source
  const secretPatterns = [
    /(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i,
    /(?:sk-|pk-)[a-zA-Z0-9]{20,}/,
  ];

  const srcDir = path.join(projectDir, 'src');
  if (fs.existsSync(srcDir)) {
    try {
      const files = getAllFiles(srcDir, ['.ts', '.js', '.py', '.go'], 3);
      for (const file of files.slice(0, 50)) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          for (const pattern of secretPatterns) {
            if (pattern.test(content) && !file.includes('.test.') && !file.includes('.example')) {
              issues.push({
                category: 'Security',
                severity: 'critical',
                message: `Potential hardcoded secret in ${path.relative(projectDir, file)}`,
                fix: 'Move secrets to environment variables',
                autoFixable: false,
              });
              break;
            }
          }
        } catch {
          // Skip unreadable files
        }
      }
    } catch {
      // Skip
    }
  }

  return issues;
}

function checkConfigs(projectDir: string): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // tsconfig.json
  const tsconfigPath = path.join(projectDir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      JSON.parse(content);
    } catch {
      issues.push({
        category: 'Config',
        severity: 'critical',
        message: 'tsconfig.json has invalid JSON',
        autoFixable: false,
      });
    }
  }

  // Check for deprecated moduleResolution
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      if (tsconfig.compilerOptions?.moduleResolution === 'node') {
        issues.push({
          category: 'Config',
          severity: 'warning',
          message: 'tsconfig.json uses deprecated "node" moduleResolution',
          fix: 'Change to "node16" or "nodenext"',
          autoFixable: false,
        });
      }
    } catch {
      // Already caught above
    }
  }

  // Docker
  const dockerPath = path.join(projectDir, 'Dockerfile');
  if (fs.existsSync(dockerPath)) {
    try {
      const content = fs.readFileSync(dockerPath, 'utf-8');
      if (content.includes('FROM node:latest')) {
        issues.push({
          category: 'Config',
          severity: 'warning',
          message: 'Dockerfile uses "node:latest" - pin a specific version',
          fix: 'Use "node:22-alpine" or similar pinned version',
          autoFixable: false,
        });
      }
    } catch {
      // Skip
    }
  }

  return issues;
}

function checkTemplateDrift(projectDir: string): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Check for common CodeScaffold project markers
  const hasPackageJson = fs.existsSync(path.join(projectDir, 'package.json'));
  const hasGoMod = fs.existsSync(path.join(projectDir, 'go.mod'));
  const hasPyproject = fs.existsSync(path.join(projectDir, 'pyproject.toml'));

  if (!hasPackageJson && !hasGoMod && !hasPyproject) {
    issues.push({
      category: 'Template',
      severity: 'info',
      message: 'No recognized project manifest found (package.json, go.mod, pyproject.toml)',
      autoFixable: false,
    });
  }

  // Check for missing .gitignore
  if (!fs.existsSync(path.join(projectDir, '.gitignore'))) {
    issues.push({
      category: 'Template',
      severity: 'warning',
      message: 'Missing .gitignore file',
      fix: 'Create a .gitignore for your project type',
      autoFixable: true,
    });
  }

  // Check for missing README
  if (!fs.existsSync(path.join(projectDir, 'README.md'))) {
    issues.push({
      category: 'Template',
      severity: 'info',
      message: 'Missing README.md',
      autoFixable: false,
    });
  }

  return issues;
}

function checkEnvironment(projectDir: string): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
    if (major < 18) {
      issues.push({
        category: 'Environment',
        severity: 'critical',
        message: `Node.js ${nodeVersion} detected - v18+ required`,
        fix: 'Upgrade Node.js to v18 or later',
        autoFixable: false,
      });
    } else if (major < 20) {
      issues.push({
        category: 'Environment',
        severity: 'info',
        message: `Node.js ${nodeVersion} detected - v20+ recommended`,
        autoFixable: false,
      });
    }
  } catch {
    issues.push({
      category: 'Environment',
      severity: 'critical',
      message: 'Node.js not found',
      autoFixable: false,
    });
  }

  // Check for lock file
  const hasLock =
    fs.existsSync(path.join(projectDir, 'package-lock.json')) ||
    fs.existsSync(path.join(projectDir, 'yarn.lock')) ||
    fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml'));

  if (fs.existsSync(path.join(projectDir, 'package.json')) && !hasLock) {
    issues.push({
      category: 'Environment',
      severity: 'warning',
      message: 'No lock file found - dependencies may not be reproducible',
      fix: 'Run "npm install" to generate package-lock.json',
      autoFixable: true,
    });
  }

  return issues;
}

function getAllFiles(dir: string, extensions: string[], maxDepth: number): string[] {
  const files: string[] = [];

  function scan(currentDir: string, depth: number): void {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist')
          continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath, depth + 1);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip unreadable dirs
    }
  }

  scan(dir, 0);
  return files;
}

function displayResults(
  issues: HealthIssue[],
  qualityReport: ReturnType<typeof runQualityChecks>
): void {
  const grouped = new Map<string, HealthIssue[]>();
  for (const issue of issues) {
    const existing = grouped.get(issue.category) || [];
    existing.push(issue);
    grouped.set(issue.category, existing);
  }

  for (const [category, categoryIssues] of grouped) {
    console.log(chalk.bold(`\n${category}:`));
    for (const issue of categoryIssues) {
      const icon =
        issue.severity === 'critical'
          ? chalk.red('✗')
          : issue.severity === 'warning'
            ? chalk.yellow('⚠')
            : chalk.blue('ℹ');
      console.log(`  ${icon} ${issue.message}`);
      if (issue.fix) {
        console.log(chalk.gray(`    Fix: ${issue.fix}`));
      }
    }
  }

  console.log();
  printQualityReport(qualityReport);
}

async function autoFix(projectDir: string, issues: HealthIssue[]): Promise<void> {
  const fixable = issues.filter(i => i.autoFixable);
  if (fixable.length === 0) {
    console.log(chalk.gray('\nNo auto-fixable issues found.\n'));
    return;
  }

  console.log(chalk.cyan(`\nAuto-fixing ${fixable.length} issue(s)...\n`));

  for (const issue of fixable) {
    try {
      if (issue.message.includes('.env') && issue.message.includes('.gitignore')) {
        const gitignorePath = path.join(projectDir, '.gitignore');
        fs.appendFileSync(gitignorePath, '\n.env\n.env.local\n');
        console.log(chalk.green('  ✓ Added .env to .gitignore'));
      }

      if (issue.message.includes('Missing .gitignore')) {
        const gitignoreContent = `node_modules/\ndist/\n.env\n.env.local\n*.log\n`;
        fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent);
        console.log(chalk.green('  ✓ Created .gitignore'));
      }

      if (issue.message.includes('outdated')) {
        console.log(chalk.gray('  ℹ Run "npm update" manually to update dependencies'));
      }

      if (issue.message.includes('lock file')) {
        execSync('npm install --package-lock-only', { cwd: projectDir, timeout: 60000 });
        console.log(chalk.green('  ✓ Generated package-lock.json'));
      }
    } catch (error) {
      console.log(chalk.red(`  ✗ Failed to fix: ${(error as Error).message}`));
    }
  }

  console.log();
}
