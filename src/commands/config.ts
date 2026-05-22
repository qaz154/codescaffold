import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { loadConfig, createDefaultConfig, printConfigInfo } from '../utils/config.js';

export interface ConfigOptions {
  init?: boolean;
  show?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  if (options.init) {
    const configPath = path.join(process.cwd(), '.codescaffoldrc');
    createDefaultConfig(configPath);
    return;
  }

  if (options.show) {
    printConfigInfo();
    return;
  }

  const configPath = path.join(process.cwd(), '.codescaffoldrc');

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('Config file already exists:'), configPath);
    console.log();
    const config = loadConfig(configPath);
    if (config) {
      console.log(chalk.bold('Current configuration:'));
      console.log(JSON.stringify(config, null, 2));
    }
    return;
  }

  createDefaultConfig(configPath);
}
