import chalk from 'chalk';
import { getCodeGeneratorService, GenerationContext } from '../ai/code-generator';
import { getAllFilesForGeneration, ProjectType } from '../ai/file-mapper';
import { AnalysisResult } from '../ai/analyzer';

export interface GenerationResult {
  generatedFilesCount: number;
  warnings: string[];
  errors: string[];
}

export async function generateCustomCode(
  projectPath: string,
  projectName: string,
  analysis: AnalysisResult
): Promise<GenerationResult> {
  const result: GenerationResult = {
    generatedFilesCount: 0,
    warnings: [],
    errors: [],
  };

  if (analysis.features.length === 0) {
    return result;
  }

  const context: GenerationContext = {
    projectName,
    projectType: analysis.projectType as ProjectType,
    features: analysis.features,
    database: analysis.database,
    outputDir: projectPath,
  };

  const codeGenerator = getCodeGeneratorService();
  const filesToGenerate = getAllFilesForGeneration(
    analysis.projectType as ProjectType,
    analysis.features
  );

  const generateableFiles = filesToGenerate.filter(f => f.generate);

  if (generateableFiles.length === 0) {
    return result;
  }

  const generationResult = await codeGenerator.generateFiles(generateableFiles, context);

  if (generationResult.files.length > 0) {
    await codeGenerator.writeGeneratedFiles(generationResult.files, projectPath);
    result.generatedFilesCount = generationResult.files.length;
  }

  result.warnings = generationResult.warnings;
  result.errors = generationResult.errors;

  return result;
}

export function logGenerationResult(result: GenerationResult): void {
  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️ Warnings:'));
    result.warnings.forEach(w => console.log(chalk.gray(`  • ${w}`)));
  }

  if (result.errors.length > 0) {
    console.log(chalk.red('\n❌ Generation errors:'));
    result.errors.forEach(e => console.log(chalk.gray(`  • ${e}`)));
  }
}
