import fs from 'fs';
import path from 'path';
import { GenerationError } from '../utils/errors.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type ProjectType = 'nextjs-fullstack' | 'express-api' | 'python-fastapi' | 'go-microservice';

export interface FileMapping {
  outputPath: string;
  templatePath?: string;
  generate: boolean;
  promptKey?: string;
  merge?: 'replace' | 'append' | 'prepend';
}

export interface FeatureMapping {
  features: string[];
  files: FileMapping[];
}

export interface ProjectConfig {
  baseFiles: FileMapping[];
  featureFiles: Record<string, FileMapping[]>;
}

export interface FileMapperConfig {
  [projectType: string]: ProjectConfig;
}

class ConfigLoadError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ConfigLoadError';
  }
}

function loadConfig(): FileMapperConfig {
  const configPath = path.join(__dirname, '../config/features.json');

  if (!fs.existsSync(configPath)) {
    throw new ConfigLoadError(`Configuration file not found: ${configPath}`);
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(configData);

    if (!parsed || typeof parsed !== 'object') {
      throw new ConfigLoadError('Invalid configuration format: expected JSON object');
    }

    return parsed as FileMapperConfig;
  } catch (error) {
    if (error instanceof ConfigLoadError) {
      throw error;
    }
    throw new ConfigLoadError(
      `Failed to parse configuration: ${(error as Error).message}`,
      error as Error
    );
  }
}

// Lazy loading with caching - throws at first use if config is invalid
let configCache: FileMapperConfig | null = null;
let configLoadAttempted = false;

function getConfig(): FileMapperConfig {
  if (configCache) {
    return configCache;
  }

  if (configLoadAttempted) {
    throw new GenerationError(
      'Configuration failed to load previously. Check features.json exists.'
    );
  }

  configLoadAttempted = true;
  configCache = loadConfig();
  return configCache;
}

export function getFilesToCopy(projectType: ProjectType): FileMapping[] {
  return getConfig()[projectType]?.baseFiles || [];
}

export function getFilesForFeatures(projectType: ProjectType, features: string[]): FileMapping[] {
  const config = getConfig()[projectType];
  if (!config) return [];

  const files: FileMapping[] = [];
  const seen = new Set<string>();

  for (const feature of features) {
    const featureFiles = config.featureFiles[feature];
    if (featureFiles) {
      for (const file of featureFiles) {
        if (!seen.has(file.outputPath)) {
          files.push(file);
          seen.add(file.outputPath);
        }
      }
    }
  }

  return files;
}

export function getAllFilesForGeneration(
  projectType: ProjectType,
  features: string[]
): FileMapping[] {
  return [...getFilesToCopy(projectType), ...getFilesForFeatures(projectType, features)];
}
