import fs from 'fs';
import path from 'path';
import { validateOutputPath, validateProjectName, PathValidationError } from '../utils/path';

interface ProjectConfig {
  name: string;
  description: string;
  author: string;
  template: string;
  output: string;
  force: boolean;
  useAi: boolean;
}

interface TemplateVariable {
  key: string;
  value: string;
}

const VARIABLES: TemplateVariable[] = [
  { key: '{{PROJECT_NAME}}', value: '' },
  { key: '{{DESCRIPTION}}', value: '' },
  { key: '{{AUTHOR}}', value: '' },
  { key: '{{YEAR}}', value: new Date().getFullYear().toString() },
  { key: '{{DATABASE_URL}}', value: 'postgresql://localhost:5432/dbname' },
];

function replaceVariables(content: string, config: ProjectConfig): string {
  let result = content;
  for (const variable of VARIABLES) {
    if (variable.key === '{{PROJECT_NAME}}') {
      result = result.replace(new RegExp(variable.key, 'g'), config.name);
    } else if (variable.key === '{{DESCRIPTION}}') {
      result = result.replace(new RegExp(variable.key, 'g'), config.description);
    } else if (variable.key === '{{AUTHOR}}') {
      result = result.replace(new RegExp(variable.key, 'g'), config.author);
    } else if (variable.key === '{{YEAR}}') {
      result = result.replace(new RegExp(variable.key, 'g'), variable.value);
    } else if (variable.key === '{{DATABASE_URL}}') {
      result = result.replace(new RegExp(variable.key, 'g'), variable.value);
    }
  }
  return result;
}

function copyTemplateDir(srcDir: string, destDir: string, config: ProjectConfig): void {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Template directory not found: ${srcDir}`);
  }

  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyTemplateDir(srcPath, destPath, config);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      content = replaceVariables(content, config);
      fs.writeFileSync(destPath, content, 'utf-8');
    }
  }
}

export async function generateProject(config: ProjectConfig): Promise<string> {
  // Validate project name
  try {
    validateProjectName(config.name);
  } catch (error) {
    if (error instanceof PathValidationError) {
      throw new Error(`Invalid project name: ${error.message}`);
    }
    throw error;
  }

  // Validate output path
  let safeOutputPath: string;
  try {
    safeOutputPath = validateOutputPath(config.output);
  } catch (error) {
    if (error instanceof PathValidationError) {
      throw new Error(`Invalid output path: ${error.message}`);
    }
    throw error;
  }

  const templateDir = path.join(__dirname, '../../templates', config.template);

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${config.template}" not found. Run "codescaffold list" to see available templates.`
    );
  }

  const projectDir = path.join(safeOutputPath, config.name);

  if (fs.existsSync(projectDir) && !config.force) {
    const files = fs.readdirSync(projectDir);
    if (files.length > 0) {
      throw new Error(
        `Directory "${projectDir}" already exists and is not empty. Use --force to overwrite.`
      );
    }
  }

  if (fs.existsSync(projectDir) && config.force) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }

  copyTemplateDir(templateDir, projectDir, config);

  return projectDir;
}
