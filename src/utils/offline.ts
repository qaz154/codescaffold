import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const CACHE_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.codescaffold',
  'cache'
);

export function isOfflineMode(): boolean {
  // 检查网络连接
  try {
    require('dns').lookup('registry.npmjs.org', (err: Error | null) => {
      if (err) throw err;
    });
    return false;
  } catch {
    return true;
  }
}

export function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function cacheTemplate(name: string, content: string): void {
  ensureCacheDir();
  const cachePath = path.join(CACHE_DIR, `${name}.json`);
  fs.writeFileSync(cachePath, JSON.stringify({ name, content, cachedAt: new Date().toISOString() }));
}

export function getCachedTemplate(name: string): string | null {
  const cachePath = path.join(CACHE_DIR, `${name}.json`);

  if (fs.existsSync(cachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      return data.content;
    } catch {
      return null;
    }
  }

  return null;
}

export function listCachedTemplates(): string[] {
  ensureCacheDir();

  try {
    const files = fs.readdirSync(CACHE_DIR);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export function clearCache(): void {
  if (fs.existsSync(CACHE_DIR)) {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(CACHE_DIR, file));
    }
    console.log(chalk.green('✓ 缓存已清除'));
  }
}

export function printOfflineStatus(): void {
  const cached = listCachedTemplates();

  console.log(chalk.cyan('\n🔌 离线状态:\n'));

  if (isOfflineMode()) {
    console.log(chalk.yellow('  当前处于离线模式'));
  } else {
    console.log(chalk.green('  当前处于在线模式'));
  }

  console.log(chalk.dim(`  已缓存模板: ${cached.length} 个`));

  if (cached.length > 0) {
    for (const name of cached) {
      console.log(chalk.dim(`    - ${name}`));
    }
  }
}
