import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { getAIService } from './openai-service';
import { getPromptTemplate, renderUserPrompt } from './prompts';
import { parseLLMResponse, GeneratedFile, CodeGenerationResponse, validateGeneratedCode } from './output-parser';
import { FileMapping, ProjectType } from './file-mapper';

export interface GenerationContext {
  projectName: string;
  projectType: ProjectType;
  features: string[];
  database: string;
  outputDir: string;
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  errors: string[];
  warnings: string[];
}

export class CodeGeneratorService {
  private maxTokens = 4000;
  private temperature = 0.3;

  async generateFiles(
    mappings: FileMapping[],
    context: GenerationContext
  ): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: true,
      files: [],
      errors: [],
      warnings: [],
    };

    const aiService = getAIService();

    if (!aiService.isConfigured()) {
      result.warnings.push('OpenAI API key not configured. Skipping AI code generation.');
      return result;
    }

    const spinner = ora({
      text: chalk.cyan('Generating code with AI...'),
      spinner: 'dots',
    }).start();

    let processedCount = 0;
    const totalMappings = mappings.filter(m => m.generate && m.promptKey).length;

    for (const mapping of mappings) {
      if (!mapping.generate || !mapping.promptKey) {
        continue;
      }

      spinner.text = chalk.cyan(`Generating ${mapping.promptKey}... (${processedCount + 1}/${totalMappings})`);

      try {
        const { files, warnings } = await this.generateFile(mapping, context);
        result.files.push(...files);
        result.warnings.push(...warnings);
        processedCount++;
        spinner.text = chalk.cyan(`Generated ${processedCount}/${totalMappings}: ${mapping.promptKey}`);
      } catch (error) {
        const errorMsg = `Failed to generate ${mapping.outputPath}: ${(error as Error).message}`;
        result.errors.push(errorMsg);
        processedCount++;
      }
    }

    if (result.errors.length > 0) {
      spinner.fail(chalk.red('AI generation completed with errors'));
    } else {
      spinner.succeed(chalk.green(`AI generation complete: ${processedCount} file(s) generated`));
    }

    result.success = result.errors.length === 0;
    return result;
  }

  private async generateFile(
    mapping: FileMapping,
    context: GenerationContext,
    maxRetries = 2
  ): Promise<{ files: GeneratedFile[]; warnings: string[] }> {
    const template = getPromptTemplate(mapping.promptKey!);
    if (!template) {
      throw new Error(`Unknown prompt key: ${mapping.promptKey}`);
    }

    const aiService = getAIService();
    const systemPrompt = template.systemPrompt;

    // Build user prompt with context
    const userPrompt = renderUserPrompt(template, {
      PROJECT_NAME: context.projectName,
      FEATURES: context.features.join(', '),
      DATABASE: context.database,
      ENTITY: context.features[0] || 'user',
      FIELDS: 'id, name, email, createdAt',
      ENTITIES: this.buildEntitiesFromFeatures(context.features),
    });

    // Retry with exponential backoff
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Call LLM
        const response = await aiService.analyzeRequirementWithPrompt(
          systemPrompt,
          userPrompt,
          template.outputSchema
        );

        // Parse response
        const parsedResponse = typeof response === 'string'
          ? parseLLMResponse(response)
          : response as CodeGenerationResponse;

        const files = parsedResponse.files.map((f) => ({
          ...f,
          language: f.language || this.detectLanguage(f.path),
        }));

        // Validate generated code
        const warnings: string[] = [];
        for (const file of files) {
          const validationErrors = validateGeneratedCode(file.content, file.language);
          if (validationErrors.length > 0) {
            warnings.push(`${file.path}: ${validationErrors.join(', ')}`);
          }
        }

        return { files, warnings };
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, don't retry
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        console.log(chalk.gray(`  Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`));
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Generation failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildEntitiesFromFeatures(features: string[]): string {
    const entities: string[] = [];

    if (features.includes('user-management') || features.includes('auth')) {
      entities.push('User: id, email, password, name, role, createdAt, updatedAt');
    }

    if (features.includes('crud')) {
      entities.push('Item: id, name, description, createdAt, updatedAt');
    }

    return entities.join('\n');
  }

  private detectLanguage(filePath: string): GeneratedFile['language'] {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.js':
      case '.jsx':
        return 'javascript';
      case '.py':
        return 'python';
      case '.go':
        return 'go';
      case '.prisma':
        return 'prisma';
      case '.yml':
      case '.yaml':
        return 'yaml';
      default:
        return 'typescript';
    }
  }

  async writeGeneratedFiles(
    files: GeneratedFile[],
    outputDir: string,
    mode: 'replace' | 'merge' = 'replace'
  ): Promise<void> {
    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      const dir = path.dirname(filePath);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Handle file writing based on merge mode
      if (mode === 'merge' && fs.existsSync(filePath)) {
        await this.mergeFiles(filePath, file.content);
      } else {
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      console.log(chalk.gray(`  Created: ${file.path}`));
    }
  }

  private async mergeFiles(existingPath: string, newContent: string): Promise<void> {
    const existing = fs.readFileSync(existingPath, 'utf-8');
    const ext = path.extname(existingPath);

    if (existing.includes('model') && newContent.includes('model')) {
      // Prisma schema merging - append new models
      const existingModels = this.extractPrismaModels(existing);
      const newModels = this.extractPrismaModels(newContent);

      let merged = existing;
      for (const model of newModels) {
        if (!merged.includes(`model ${model.name} {`)) {
          merged += '\n' + model.content;
        }
      }

      fs.writeFileSync(existingPath, merged, 'utf-8');
    } else if (['.ts', '.tsx', '.go', '.py', '.js', '.jsx'].includes(ext)) {
      // TypeScript/JavaScript/Go/Python - smart merge by appending new exports
      const newExports = this.extractNewExports(existing, newContent, ext);
      if (newExports.length > 0) {
        const merged = existing + '\n\n// ===== AI GENERATED =====\n' + newExports.join('\n');
        fs.writeFileSync(existingPath, merged, 'utf-8');
      } else {
        // No new exports to add, append with marker
        fs.writeFileSync(existingPath, existing + '\n\n// ===== AI GENERATED =====\n' + newContent, 'utf-8');
      }
    } else {
      // Other files - append with separator
      fs.writeFileSync(existingPath, existing + '\n\n// ===== AI GENERATED =====\n' + newContent, 'utf-8');
    }
  }

  private extractNewExports(existing: string, newContent: string, ext: string): string[] {
    const existingFuncs = new Set<string>();

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      // TypeScript/JavaScript: extract function and const declarations
      const funcRegex = /(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=)/g;
      let match;
      while ((match = funcRegex.exec(existing)) !== null) {
        existingFuncs.add(match[1] || match[2]);
      }
      // Also match arrow functions
      const arrowRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
      while ((match = arrowRegex.exec(existing)) !== null) {
        existingFuncs.add(match[1]);
      }
    } else if (ext === '.go') {
      // Go: extract function declarations
      const funcRegex = /func\s+(\w+)\s*\(/g;
      let match;
      while ((match = funcRegex.exec(existing)) !== null) {
        existingFuncs.add(match[1]);
      }
    } else if (ext === '.py') {
      // Python: extract function and class definitions
      const funcRegex = /(?:def|class)\s+(\w+)\s*[(:]/g;
      let match;
      while ((match = funcRegex.exec(existing)) !== null) {
        existingFuncs.add(match[1]);
      }
    }

    // Extract functions from newContent that don't exist in existing
    const newExports: string[] = [];
    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      const funcRegex = /(export\s+)?(?:async\s+)?function\s+(\w+)/g;
      let match;
      while ((match = funcRegex.exec(newContent)) !== null) {
        const name = match[2];
        if (!existingFuncs.has(name) && !newExports.some(e => e.includes(`function ${name}`))) {
          newExports.push(match[0]);
        }
      }
      // Arrow functions
      const arrowRegex = /(export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
      while ((match = arrowRegex.exec(newContent)) !== null) {
        const name = match[2];
        if (!existingFuncs.has(name) && !newExports.some(e => e.includes(`const ${name}`))) {
          newExports.push(match[0]);
        }
      }
    } else if (ext === '.go') {
      const funcRegex = /func\s+(\w+)\s*\(/g;
      let match;
      while ((match = funcRegex.exec(newContent)) !== null) {
        const name = match[1];
        if (!existingFuncs.has(name)) {
          newExports.push(match[0]);
        }
      }
    } else if (ext === '.py') {
      const funcRegex = /(?:def|class)\s+(\w+)\s*[(:]/g;
      let match;
      while ((match = funcRegex.exec(newContent)) !== null) {
        const name = match[1];
        if (!existingFuncs.has(name)) {
          newExports.push(match[0]);
        }
      }
    }

    return newExports;
  }

  private extractPrismaModels(content: string): Array<{ name: string; content: string }> {
    const models: Array<{ name: string; content: string }> = [];
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = modelRegex.exec(content)) !== null) {
      models.push({
        name: match[1],
        content: `model ${match[1]} { ${match[2]} }`,
      });
    }

    return models;
  }
}

// Singleton instance
let serviceInstance: CodeGeneratorService | null = null;

export function getCodeGeneratorService(): CodeGeneratorService {
  if (!serviceInstance) {
    serviceInstance = new CodeGeneratorService();
  }
  return serviceInstance;
}
