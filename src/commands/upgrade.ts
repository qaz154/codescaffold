import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import { handleCLIError } from '../utils/errors';

interface UpgradeOptions {
  directory?: string;
  force?: boolean;
  backup?: boolean;
}

interface UpgradeResult {
  success: boolean;
  upgradedFiles: string[];
  skippedFiles: string[];
  errors: string[];
}

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

function getTemplateVersion(projectDir: string): string | null {
  const pkgPath = path.join(projectDir, 'package.json');

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.scaffoldVersion || pkg.version || null;
    } catch {
      return null;
    }
  }

  return null;
}

async function backupProject(projectDir: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = `${projectDir}.backup.${timestamp}`;

  const copyRecursive = (src: string, dest: string): void => {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursive(projectDir, backupDir);
  return backupDir;
}

function getUpgradeableFiles(template: string): string[] {
  const templateDir = path.join(__dirname, '../../templates', template);

  if (!fs.existsSync(templateDir)) {
    return [];
  }

  const files: string[] = [];

  const scanDir = (dir: string, relativePath: string = ''): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        scanDir(fullPath, relPath);
      } else {
        files.push(relPath);
      }
    }
  };

  scanDir(templateDir);
  return files;
}

async function upgradeFiles(
  projectDir: string,
  template: string,
  files: string[]
): Promise<UpgradeResult> {
  const result: UpgradeResult = {
    success: true,
    upgradedFiles: [],
    skippedFiles: [],
    errors: [],
  };

  const templateDir = path.join(__dirname, '../../templates', template);

  for (const file of files) {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(projectDir, file);

    try {
      if (!fs.existsSync(srcPath)) {
        result.skippedFiles.push(file);
        continue;
      }

      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(srcPath, destPath);
      result.upgradedFiles.push(file);
    } catch (error) {
      result.errors.push(`${file}: ${(error as Error).message}`);
      result.success = false;
    }
  }

  return result;
}

export async function upgradeCommand(options: UpgradeOptions): Promise<void> {
  try {
    const projectDir = path.resolve(options.directory || '.');

    if (!fs.existsSync(projectDir)) {
      console.log(chalk.red(`Directory not found: ${projectDir}`));
      process.exit(1);
    }

    const template = detectTemplate(projectDir);

    if (!template) {
      console.log(chalk.red('Could not detect project template'));
      console.log(chalk.gray('Make sure you are in a CodeScaffold-generated project directory.'));
      process.exit(1);
    }

    const currentVersion = getTemplateVersion(projectDir);

    console.log(chalk.cyan('\n⬆️  Template Upgrade\n'));
    console.log(chalk.gray(`Template: ${template}`));
    console.log(chalk.gray(`Current version: ${currentVersion || 'unknown'}\n`));

    const upgradeableFiles = getUpgradeableFiles(template);

    if (upgradeableFiles.length === 0) {
      console.log(chalk.yellow('No upgradeable files found.'));
      process.exit(0);
    }

    console.log(chalk.bold('Files that will be upgraded:'));
    for (const file of upgradeableFiles.slice(0, 20)) {
      console.log(chalk.dim(`  - ${file}`));
    }

    if (upgradeableFiles.length > 20) {
      console.log(chalk.dim(`  ... and ${upgradeableFiles.length - 20} more`));
    }

    console.log();

    const { confirmUpgrade, createBackup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmUpgrade',
        message: 'Proceed with upgrade?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'createBackup',
        message: 'Create backup before upgrading?',
        default: true,
        when: answers => answers.confirmUpgrade,
      },
    ]);

    if (!confirmUpgrade) {
      console.log(chalk.gray('Upgrade cancelled.'));
      process.exit(0);
    }

    const spinner = ora({
      text: chalk.cyan('Upgrading template files...'),
      spinner: 'dots',
    }).start();

    let backupPath: string | null = null;

    if (createBackup) {
      spinner.text = chalk.cyan('Creating backup...');
      backupPath = await backupProject(projectDir);
      spinner.text = chalk.green(`Backup created: ${path.basename(backupPath)}`);
    }

    spinner.text = chalk.cyan('Upgrading files...');
    const result = await upgradeFiles(projectDir, template, upgradeableFiles);

    if (result.success) {
      spinner.succeed(chalk.green('Upgrade completed successfully'));
    } else {
      spinner.warn(chalk.yellow('Upgrade completed with some errors'));
    }

    console.log(chalk.cyan('\n📋 Upgrade Results:\n'));
    console.log(chalk.green(`  ✓ Upgraded: ${result.upgradedFiles.length} files`));

    if (result.skippedFiles.length > 0) {
      console.log(chalk.gray(`  - Skipped: ${result.skippedFiles.length} files`));
    }

    if (result.errors.length > 0) {
      console.log(chalk.red(`  ✗ Errors: ${result.errors.length} files`));
      for (const error of result.errors) {
        console.log(chalk.red(`    → ${error}`));
      }
    }

    if (backupPath) {
      console.log(chalk.gray(`\n  Backup saved to: ${backupPath}`));
    }

    console.log();
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}
