import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface UserPreferences {
  lastFramework?: string;
  lastDatabase?: string;
  lastAuth?: string;
  lastUi?: string;
  lastTemplate?: string;
  defaultAuthor?: string;
  defaultLicense?: string;
}

const PREFS_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.codescaffold',
  'preferences.json'
);

export function loadPreferences(): UserPreferences {
  try {
    if (fs.existsSync(PREFS_PATH)) {
      const data = fs.readFileSync(PREFS_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return {};
}

export function savePreferences(prefs: UserPreferences): void {
  const dir = path.dirname(PREFS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2));
}

export function updatePreferences(update: Partial<UserPreferences>): void {
  const prefs = loadPreferences();
  const updated = { ...prefs, ...update };
  savePreferences(updated);
}

export function resetPreferences(): void {
  if (fs.existsSync(PREFS_PATH)) {
    fs.unlinkSync(PREFS_PATH);
    console.log(chalk.green('✓ 偏好设置已重置'));
  } else {
    console.log(chalk.yellow('没有找到偏好设置'));
  }
}

export function showPreferences(): void {
  const prefs = loadPreferences();

  if (Object.keys(prefs).length === 0) {
    console.log(chalk.yellow('\n没有保存的偏好设置'));
    return;
  }

  console.log(chalk.cyan('\n📋 偏好设置:\n'));

  if (prefs.lastFramework) {
    console.log(`  ${chalk.bold('上次框架:')} ${prefs.lastFramework}`);
  }
  if (prefs.lastDatabase) {
    console.log(`  ${chalk.bold('上次数据库:')} ${prefs.lastDatabase}`);
  }
  if (prefs.lastAuth) {
    console.log(`  ${chalk.bold('上次认证:')} ${prefs.lastAuth}`);
  }
  if (prefs.lastUi) {
    console.log(`  ${chalk.bold('上次 UI:')} ${prefs.lastUi}`);
  }
  if (prefs.lastTemplate) {
    console.log(`  ${chalk.bold('上次模板:')} ${prefs.lastTemplate}`);
  }
}
