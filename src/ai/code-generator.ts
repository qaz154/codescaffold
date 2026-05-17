import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { getAIService } from './openai-service';
import { getPromptTemplate, renderUserPrompt } from './prompts';
import {
  parseLLMResponse,
  GeneratedFile,
  CodeGenerationResponse,
  validateGeneratedCode,
  detectLanguageFromPath,
} from './output-parser';
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

      spinner.text = chalk.cyan(
        `Generating ${mapping.promptKey}... (${processedCount + 1}/${totalMappings})`
      );

      try {
        const { files, warnings } = await this.generateFile(mapping, context);
        result.files.push(...files);
        result.warnings.push(...warnings);
        processedCount++;
        spinner.text = chalk.cyan(
          `Generated ${processedCount}/${totalMappings}: ${mapping.promptKey}`
        );
      } catch (error) {
        const errorMsg = `Failed to generate ${mapping.promptKey}: ${(error as Error).message}`;
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

    const userPrompt = renderUserPrompt(template, {
      PROJECT_NAME: context.projectName,
      FEATURES: context.features.join(', '),
      DATABASE: context.database,
      ENTITY: context.features[0] || 'user',
      FIELDS: 'id, name, email, createdAt',
      ENTITIES: this.buildEntitiesFromFeatures(context.features),
    });

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await aiService.analyzeRequirementWithPrompt(
          systemPrompt,
          userPrompt,
          template.outputSchema
        );

        const parsedResponse =
          typeof response === 'string'
            ? parseLLMResponse(response)
            : (response as CodeGenerationResponse);

        const files = parsedResponse.files.map(f => ({
          ...f,
          language: f.language || detectLanguageFromPath(f.path),
        }));

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

        if (attempt === maxRetries) {
          break;
        }

        const delay = Math.pow(2, attempt) * 1000;
        console.log(chalk.gray(`  Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`));
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Generation failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  async writeGeneratedFiles(files: GeneratedFile[], outputDir: string): Promise<void> {
    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Always replace - merging is unsafe
      fs.writeFileSync(filePath, file.content, 'utf-8');
      console.log(chalk.gray(`  Created: ${file.path}`));
    }
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
