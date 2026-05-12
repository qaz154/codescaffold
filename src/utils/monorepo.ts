import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface MonorepoInfo {
  isMonorepo: boolean;
  type: 'pnpm-workspace' | 'turborepo' | 'nx' | 'lerna' | 'yarn-workspace' | null;
  packagesDir: string[];
}

export function detectMonorepo(projectPath: string): MonorepoInfo {
  const info: MonorepoInfo = {
    isMonorepo: false,
    type: null,
    packagesDir: [],
  };

  // pnpm workspace
  if (fs.existsSync(path.join(projectPath, 'pnpm-workspace.yaml'))) {
    info.isMonorepo = true;
    info.type = 'pnpm-workspace';
    info.packagesDir = ['packages', 'apps'];
  }

  // Turborepo
  if (fs.existsSync(path.join(projectPath, 'turbo.json'))) {
    info.isMonorepo = true;
    info.type = 'turborepo';
    info.packagesDir = ['apps', 'packages'];
  }

  // Nx
  if (fs.existsSync(path.join(projectPath, 'nx.json'))) {
    info.isMonorepo = true;
    info.type = 'nx';
    info.packagesDir = ['apps', 'libs'];
  }

  // Lerna
  if (fs.existsSync(path.join(projectPath, 'lerna.json'))) {
    info.isMonorepo = true;
    info.type = 'lerna';
    info.packagesDir = ['packages'];
  }

  // Yarn workspaces
  const pkgPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.workspaces) {
        info.isMonorepo = true;
        info.type = 'yarn-workspace';
        info.packagesDir = Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : pkg.workspaces.packages || ['packages'];
      }
    } catch {
      // ignore
    }
  }

  return info;
}

export function getMonorepoPackages(projectPath: string): string[] {
  const info = detectMonorepo(projectPath);

  if (!info.isMonorepo) {
    return [];
  }

  const packages: string[] = [];

  for (const dir of info.packagesDir) {
    const dirPath = path.join(projectPath, dir);
    if (fs.existsSync(dirPath)) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgPath = path.join(dirPath, entry.name, 'package.json');
          if (fs.existsSync(pkgPath)) {
            packages.push(`${dir}/${entry.name}`);
          }
        }
      }
    }
  }

  return packages;
}

export function printMonorepoInfo(projectPath: string): void {
  const info = detectMonorepo(projectPath);

  if (!info.isMonorepo) {
    return;
  }

  console.log(chalk.cyan('\n📁 Monorepo 检测:\n'));
  console.log(`  ${chalk.bold('类型:')} ${info.type}`);
  console.log(`  ${chalk.bold('包目录:')} ${info.packagesDir.join(', ')}`);

  const packages = getMonorepoPackages(projectPath);
  if (packages.length > 0) {
    console.log(chalk.dim(`  已发现 ${packages.length} 个包`));
    for (const pkg of packages.slice(0, 5)) {
      console.log(chalk.dim(`    - ${pkg}`));
    }
    if (packages.length > 5) {
      console.log(chalk.dim(`    ... 还有 ${packages.length - 5} 个`));
    }
  }
}
