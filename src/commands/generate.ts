import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateWithAI } from '../generator';
import { handleCLIError, ValidationError } from '../utils/errors';
import { loadConfig } from '../utils/config';
import { getAIService } from '../ai/openai-service';

interface GenerateOptions {
  requirement?: string;
  output?: string;
  force?: boolean;
  provider?: 'openai' | 'claude' | 'local';
  model?: string;
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

    const report = await generateWithAI({
      requirement,
      output: options.output || effectiveOutput,
      force: options.force || false,
    });

    console.log(chalk.green('\n🎉 Project generated successfully!\n'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.cyan(`  cd ${report.projectPath}`));

    const projectType = report.analysis.projectType;

    if (projectType === 'nextjs-fullstack' || projectType === 'express-api') {
      console.log(chalk.gray('  npm install'));
      console.log(chalk.gray('  npm run dev'));
    } else if (projectType === 'python-fastapi') {
      console.log(chalk.gray('  pip install -e ".[dev]"'));
      console.log(chalk.gray('  uvicorn app.main:app --reload'));
    } else if (projectType === 'go-microservice') {
      console.log(chalk.gray('  go mod tidy'));
      console.log(chalk.gray('  go run cmd/server/main.go'));
    }

    if (report.generatedFiles && report.generatedFiles > 0) {
      console.log(chalk.cyan(`\n📝 AI generated ${report.generatedFiles} custom file(s)\n`));
    }
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}
