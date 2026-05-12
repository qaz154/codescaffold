import { execSync } from 'child_process';
import chalk from 'chalk';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface PackageManagerInfo {
  name: PackageManager;
  available: boolean;
  version?: string;
}

export function detectPackageManagers(): PackageManagerInfo[] {
  const managers: PackageManagerInfo[] = [];

  const commands: Array<{ name: PackageManager; cmd: string }> = [
    { name: 'npm', cmd: 'npm --version' },
    { name: 'yarn', cmd: 'yarn --version' },
    { name: 'pnpm', cmd: 'pnpm --version' },
    { name: 'bun', cmd: 'bun --version' },
  ];

  for (const { name, cmd } of commands) {
    try {
      const version = execSync(cmd, { encoding: 'utf-8' }).trim();
      managers.push({ name, available: true, version });
    } catch {
      managers.push({ name, available: false });
    }
  }

  return managers;
}

export function getInstallCommand(manager: PackageManager): string {
  switch (manager) {
    case 'yarn':
      return 'yarn install';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
    default:
      return 'npm install';
  }
}

export function getDevCommand(manager: PackageManager): string {
  switch (manager) {
    case 'yarn':
      return 'yarn dev';
    case 'pnpm':
      return 'pnpm dev';
    case 'bun':
      return 'bun run dev';
    default:
      return 'npm run dev';
  }
}

export function printPackageManagerInfo(): void {
  const managers = detectPackageManagers();

  console.log(chalk.cyan('\n📦 包管理器:\n'));

  for (const m of managers) {
    const status = m.available
      ? chalk.green(`✓ ${m.version}`)
      : chalk.red('✗ 未安装');
    console.log(`  ${chalk.bold(m.name.padEnd(8))} ${status}`);
  }
}

export function selectPackageManager(): PackageManager {
  const managers = detectPackageManagers();
  const available = managers.filter((m) => m.available);

  if (available.length === 0) {
    return 'npm'; // 默认
  }

  // 优先级: bun > pnpm > yarn > npm
  const priority: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm'];
  for (const pm of priority) {
    if (available.some((m) => m.name === pm)) {
      return pm;
    }
  }

  return 'npm';
}
