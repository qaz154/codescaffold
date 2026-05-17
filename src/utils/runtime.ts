import { execSync } from 'child_process';
import chalk from 'chalk';

export type Runtime = 'node' | 'bun' | 'deno';

export interface RuntimeInfo {
  name: Runtime;
  available: boolean;
  version?: string;
}

export function detectRuntimes(): RuntimeInfo[] {
  const runtimes: RuntimeInfo[] = [];

  // Node.js
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim();
    runtimes.push({ name: 'node', available: true, version });
  } catch {
    runtimes.push({ name: 'node', available: false });
  }

  // Bun
  try {
    const version = execSync('bun --version', { encoding: 'utf-8' }).trim();
    runtimes.push({ name: 'bun', available: true, version });
  } catch {
    runtimes.push({ name: 'bun', available: false });
  }

  // Deno
  try {
    const version = execSync('deno --version', { encoding: 'utf-8' }).split('\n')[0].trim();
    runtimes.push({ name: 'deno', available: true, version });
  } catch {
    runtimes.push({ name: 'deno', available: false });
  }

  return runtimes;
}

export function getRuntimeCommands(runtime: Runtime): Record<string, string> {
  switch (runtime) {
    case 'bun':
      return {
        install: 'bun install',
        dev: 'bun run dev',
        build: 'bun run build',
        start: 'bun run start',
      };
    case 'deno':
      return {
        install: 'deno install',
        dev: 'deno task dev',
        build: 'deno task build',
        start: 'deno task start',
      };
    default:
      return {
        install: 'npm install',
        dev: 'npm run dev',
        build: 'npm run build',
        start: 'npm run start',
      };
  }
}

export function printRuntimeInfo(): void {
  const runtimes = detectRuntimes();

  console.log(chalk.cyan('\n runtime 信息:\n'));

  for (const rt of runtimes) {
    const status = rt.available ? chalk.green(`✓ ${rt.version}`) : chalk.red('✗ 未安装');
    console.log(`  ${chalk.bold(rt.name.padEnd(8))} ${status}`);
  }
}
