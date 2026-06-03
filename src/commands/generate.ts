import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateWithAI } from '../generator/index.js';
import { handleCLIError, ValidationError } from '../utils/errors.js';
import { loadConfig } from '../utils/config.js';
import { getAIService } from '../ai/openai-service.js';
import { getTemplateNextSteps } from '../utils/next-steps.js';
import { analyzeRequirements } from '../ai/analyzer.js';
import { recommendArchitecture } from '../ai/architect.js';

interface GenerateOptions {
  requirement?: string;
  output?: string;
  force?: boolean;
  provider?: 'openai' | 'claude' | 'local';
  model?: string;
  preview?: boolean;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  try {
    const config = loadConfig();

    const effectiveProvider = options.provider || config?.provider;
    const effectiveModel = options.model || config?.model;
    const effectiveOutput = options.output || config?.defaultOutput || '.';

    if (effectiveProvider || effectiveModel) {
      getAIService({
        provider: effectiveProvider,
        model: effectiveModel,
      });
    }

    let requirement = options.requirement;

    if (!requirement) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'requirement',
          message: 'Describe your project requirement:',
          default: 'A user management system with authentication and CRUD operations',
          validate: (input: string) => {
            if (input.trim().length < 5) {
              return 'Please provide a more detailed requirement (at least 5 characters)';
            }
            return true;
          },
        },
        {
          type: 'input',
          name: 'output',
          message: 'Output directory:',
          default: effectiveOutput,
        },
        {
          type: 'confirm',
          name: 'force',
          message: 'Overwrite existing files?',
          default: options.force || false,
        },
      ]);

      requirement = answers.requirement;
      options.output = answers.output;
      options.force = answers.force;
    }

    if (!requirement) {
      throw new ValidationError(
        'Requirement is required',
        'Use --requirement option or enter a requirement when prompted'
      );
    }

    console.log(
      chalk.dim(`\nUsing AI provider: ${chalk.cyan(effectiveProvider || 'auto-detected')}`)
    );
    if (effectiveModel) {
      console.log(chalk.dim(`Model: ${chalk.cyan(effectiveModel)}`));
    }
    console.log();

    if (options.preview) {
      await showGeneratePreview(requirement);
      return;
    }

    const report = await generateWithAI({
      requirement,
      output: options.output || effectiveOutput,
      force: options.force || false,
    });

    console.log(chalk.green('\nProject generated successfully!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.cyan(`  cd ${report.projectPath}`));

    const projectType = report.analysis.projectType;
    for (const step of getTemplateNextSteps(projectType)) {
      console.log(chalk.gray(`  ${step}`));
    }

    if (report.generatedFiles && report.generatedFiles > 0) {
      console.log(chalk.cyan(`\nAI generated ${report.generatedFiles} custom file(s)\n`));
    }
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

async function showGeneratePreview(requirement: string): Promise<void> {
  console.log(chalk.cyan('\nAI Analysis Preview (dry run, no files written)\n'));

  const aiService = getAIService();
  let analysis;

  if (aiService.isConfigured()) {
    try {
      console.log(chalk.gray('Running AI analysis...'));
      const aiResult = await aiService.analyzeRequirements(requirement);
      analysis = {
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
      console.log(chalk.green('AI analysis complete\n'));
    } catch {
      console.log(chalk.yellow('AI analysis failed, using keyword analysis\n'));
      analysis = analyzeRequirements(requirement);
    }
  } else {
    console.log(chalk.gray('No AI configured, using keyword analysis\n'));
    analysis = analyzeRequirements(requirement);
  }

  const architecture = recommendArchitecture(analysis);

  console.log(chalk.bold('Detected:'));
  console.log(`  Template:   ${chalk.green(analysis.projectType)}`);
  console.log(`  Database:   ${chalk.green(analysis.database)}`);
  console.log(`  Features:   ${chalk.green(analysis.features.join(', ') || 'none')}`);
  console.log(`  Auth:       ${analysis.auth ? chalk.green('yes') : chalk.gray('no')}`);
  console.log(`  Docker:     ${analysis.docker ? chalk.green('yes') : chalk.gray('no')}`);

  console.log(chalk.bold('\nArchitecture:'));
  console.log(`  Backend:    ${chalk.green(architecture.techStack.backend)}`);
  console.log(`  Database:   ${chalk.green(architecture.techStack.database)}`);
  if (architecture.techStack.frontend) {
    console.log(`  Frontend:   ${chalk.green(architecture.techStack.frontend)}`);
  }
  console.log(`  Testing:    ${chalk.green(architecture.techStack.testing.join(', '))}`);

  console.log(chalk.bold('\nWould generate:'));
  console.log(`  Base template: ${chalk.green(analysis.projectType)}`);
  if (analysis.features.length > 0) {
    console.log(`  AI files:      ${chalk.green(analysis.features.length + ' feature modules')}`);
  }

  console.log(chalk.bold('\nNext steps (if run without --preview):'));
  for (const step of getTemplateNextSteps(analysis.projectType)) {
    console.log(chalk.gray(`  ${step}`));
  }

  console.log(chalk.cyan('\nRun without --preview to generate the project.\n'));
}
