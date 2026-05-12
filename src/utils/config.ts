import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import chalk from 'chalk';

export const ConfigSchema = z.object({
  provider: z.enum(['openai', 'claude', 'local']).optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  defaultTemplate: z.string().optional(),
  defaultOutput: z.string().optional(),
  templates: z.record(z.string(), z.object({
    enabled: z.boolean().optional(),
    overrides: z.record(z.string(), z.string()).optional(),
  })).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

const CONFIG_FILES = [
  '.codescaffoldrc',
  '.codescaffoldrc.json',
  'codescaffold.config.json',
  '.codescaffoldrc.yaml',
];

export function findConfigFile(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    for (const configFile of CONFIG_FILES) {
      const configPath = path.join(currentDir, configFile);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (homeDir) {
    for (const configFile of CONFIG_FILES) {
      const configPath = path.join(homeDir, configFile);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
  }

  return null;
}

export function loadConfig(configPath?: string): Config | null {
  const filePath = configPath || findConfigFile();

  if (!filePath) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      console.log(chalk.yellow('Warning: YAML config files require js-yaml. Using JSON format is recommended.'));
      return null;
    }

    const parsed = JSON.parse(content);
    const result = ConfigSchema.safeParse(parsed);

    if (!result.success) {
      console.log(chalk.yellow(`Warning: Invalid config file: ${result.error.message}`));
      return null;
    }

    return result.data;
  } catch (error) {
    console.log(chalk.yellow(`Warning: Failed to load config file: ${(error as Error).message}`));
    return null;
  }
}

export function createDefaultConfig(outputPath: string): void {
  const defaultConfig: Config = {
    provider: 'openai',
    model: 'gpt-4o-mini',
    defaultTemplate: 'express-api',
    defaultOutput: '.',
    templates: {
      'express-api': {
        enabled: true,
      },
      'nextjs-fullstack': {
        enabled: true,
      },
      'python-fastapi': {
        enabled: true,
      },
      'go-microservice': {
        enabled: true,
      },
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  console.log(chalk.green(`✓ Created default config file: ${outputPath}`));
}

export function printConfigInfo(): void {
  const configPath = findConfigFile();

  if (!configPath) {
    console.log(chalk.dim('  Config: Using defaults (no config file found)'));
    return;
  }

  const config = loadConfig(configPath);

  if (!config) {
    console.log(chalk.dim('  Config: Using defaults (config file invalid)'));
    return;
  }

  console.log(chalk.dim(`  Config: ${chalk.cyan(configPath)}`));

  if (config.provider) {
    console.log(chalk.dim(`    Provider: ${config.provider}`));
  }

  if (config.model) {
    console.log(chalk.dim(`    Model: ${config.model}`));
  }

  if (config.defaultTemplate) {
    console.log(chalk.dim(`    Default Template: ${config.defaultTemplate}`));
  }
}
