import chalk from 'chalk';

export const version = '1.14.1';

interface NpmPackageInfo {
  version: string;
}

export async function checkForUpdates(): Promise<{ hasUpdate: boolean; latestVersion: string } | null> {
  try {
    const response = await fetch('https://registry.npmjs.org/codescaffold/latest', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NpmPackageInfo;
    const latestVersion = data.version;

    const hasUpdate = compareVersions(latestVersion, version) > 0;

    return { hasUpdate, latestVersion };
  } catch {
    return null;
  }
}

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;

    if (partA > partB) return 1;
    if (partA < partB) return -1;
  }

  return 0;
}

export function printUpdateNotice(latestVersion: string): void {
  console.log();
  console.log(chalk.yellow('┌─────────────────────────────────────────────────────────────┐'));
  console.log(chalk.yellow('│') + chalk.bold.yellow('  A new version of CodeScaffold is available!                ') + chalk.yellow('│'));
  console.log(chalk.yellow('│') + chalk.dim(`  Current: ${version.padEnd(12)} Latest: ${latestVersion.padEnd(12)}    `) + chalk.yellow('│'));
  console.log(chalk.yellow('│') + chalk.cyan('  Run: npm update -g codescaffold                            ') + chalk.yellow('│'));
  console.log(chalk.yellow('└─────────────────────────────────────────────────────────────┘'));
  console.log();
}
