import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { analyzeRequirements, formatAnalysisReport, AnalysisResult } from '../ai/analyzer';
import {
  recommendArchitecture,
  formatArchitectureReport,
  ArchitectureRecommendation,
} from '../ai/architect';
import { getAIService, AIAnalysisResult } from '../ai/openai-service';
import { copyTemplate, extractProjectName } from './copy';
import { generateCustomCode, logGenerationResult } from './generate';

export interface AIGenerateOptions {
  requirement: string;
  output: string;
  force: boolean;
}

export interface GenerationReport {
  analysis: AnalysisResult;
  architecture: ArchitectureRecommendation;
  projectPath: string;
  usedAI: boolean;
  generatedFiles?: number;
}

/**
 * Converts AI analysis result to internal AnalysisResult format
 */
function convertAIResult(aiResult: AIAnalysisResult): AnalysisResult {
  return {
    projectType: aiResult.projectType,
    features: aiResult.features,
    database: aiResult.database,
    auth: aiResult.features.includes('auth'),
    api: true,
    ui: aiResult.features.some((f: string) =>
      ['admin-dashboard', 'frontend', 'ui'].includes(f.toLowerCase())
    ),
    docker: true,
    ci: true,
  };
}

/**
 * Analyzes requirements using AI or falls back to keyword-based analysis
 */
async function analyzeWithFallback(
  requirement: string
): Promise<{ analysis: AnalysisResult; usedAI: boolean }> {
  const aiService = getAIService();

  if (!aiService.isConfigured()) {
    console.log(chalk.gray('OpenAI API key not found. Using keyword-based analysis.'));
    console.log(chalk.gray('Set OPENAI_API_KEY environment variable for enhanced AI analysis.\n'));
    return { analysis: analyzeRequirements(requirement), usedAI: false };
  }

  try {
    console.log(chalk.gray('Using OpenAI for enhanced analysis...\n'));
    const aiResult = await aiService.analyzeRequirements(requirement);
    const analysis = convertAIResult(aiResult);
    console.log(chalk.green('✅ AI analysis complete\n'));
    return { analysis, usedAI: true };
  } catch (error) {
    console.log(chalk.yellow(`⚠️ AI analysis failed: ${(error as Error).message}`));
    console.log(chalk.gray('Falling back to keyword-based analysis...\n'));
    return { analysis: analyzeRequirements(requirement), usedAI: false };
  }
}

/**
 * Main entry point for AI-powered project generation
 *
 * @param options - Generation options including requirement, output path, and force flag
 * @returns GenerationReport with analysis, architecture, and project details
 */
export async function generateWithAI(options: AIGenerateOptions): Promise<GenerationReport> {
  console.log(chalk.cyan('\n🤖 Analyzing your requirements...\n'));

  // Step 1: Analyze requirements (AI or keyword-based)
  const { analysis, usedAI } = await analyzeWithFallback(options.requirement);
  console.log(formatAnalysisReport(analysis));
  console.log();

  // Step 2: Get architecture recommendation
  const architecture = recommendArchitecture(analysis);
  console.log(formatArchitectureReport(architecture));
  console.log();

  // Step 3: Copy base template
  console.log(chalk.cyan(`\n📦 Generating ${analysis.projectType} project...\n`));

  const projectName = extractProjectName(options.requirement);

  const projectPath = await copyTemplate({
    projectName,
    description: options.requirement,
    template: analysis.projectType,
    output: options.output,
    force: options.force,
  });

  console.log(chalk.green(`✅ Base template copied successfully\n`));

  // Step 4: Generate additional code with AI (if configured and features detected)
  let generatedFilesCount = 0;

  if (usedAI && analysis.features.length > 0) {
    console.log(chalk.cyan('🔧 Generating custom code with AI...\n'));

    const result = await generateCustomCode(projectPath, projectName, analysis);
    generatedFilesCount = result.generatedFilesCount;

    logGenerationResult(result);
  }

  console.log(chalk.green(`\n✅ Project generated successfully at ${chalk.bold(projectPath)}\n`));

  if (generatedFilesCount > 0) {
    console.log(chalk.cyan(`📝 AI-generated ${generatedFilesCount} custom file(s)\n`));
  }

  return {
    analysis,
    architecture,
    projectPath,
    usedAI,
    generatedFiles: generatedFilesCount,
  };
}

/**
 * Validates if a template exists
 *
 * @param template - Template name to validate
 * @returns true if template exists and is a directory
 */
export async function validateTemplate(template: string): Promise<boolean> {
  const templatesDir = path.join(__dirname, '../../templates');
  const templatePath = path.join(templatesDir, template);
  return fs.existsSync(templatePath) && fs.statSync(templatePath).isDirectory();
}

/**
 * Lists all available templates
 *
 * @returns Array of template names
 */
export function listTemplates(): string[] {
  const templatesDir = path.join(__dirname, '../../templates');
  return fs.readdirSync(templatesDir).filter(dir => {
    const stat = fs.statSync(path.join(templatesDir, dir));
    return stat.isDirectory();
  });
}
