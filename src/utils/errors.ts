import chalk from 'chalk';

export class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

export class ValidationError extends CLIError {
  constructor(message: string, suggestion?: string) {
    super(message, 'VALIDATION_ERROR', suggestion);
    this.name = 'ValidationError';
  }
}

export class TemplateError extends CLIError {
  constructor(message: string, suggestion?: string) {
    super(message, 'TEMPLATE_ERROR', suggestion);
    this.name = 'TemplateError';
  }
}

export class GenerationError extends CLIError {
  constructor(message: string, suggestion?: string) {
    super(message, 'GENERATION_ERROR', suggestion);
    this.name = 'GenerationError';
  }
}

export function formatError(error: unknown): string {
  if (error instanceof CLIError) {
    let output = chalk.red(`Error [${error.code}]: ${error.message}`);
    if (error.suggestion) {
      output += `\n\n${chalk.cyan('Suggestion:')} ${error.suggestion}`;
    }
    return output;
  }

  if (error instanceof Error) {
    return chalk.red(`Error: ${error.message}`);
  }

  return chalk.red('An unexpected error occurred');
}

export function handleCLIError(error: unknown): void {
  console.error('\n' + formatError(error));
  console.log();

  if (error instanceof CLIError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        console.log(chalk.gray('  • Check the command usage with --help'));
        console.log(chalk.gray('  • Ensure all required options are provided'));
        break;
      case 'TEMPLATE_ERROR':
        console.log(chalk.gray('  • Run "codescaffold list" to see available templates'));
        console.log(chalk.gray('  • Run "codescaffold info <template>" for template details'));
        break;
      case 'GENERATION_ERROR':
        console.log(chalk.gray('  • Check if the output directory is writable'));
        console.log(chalk.gray('  • Use --force to overwrite existing files'));
        break;
    }
  }

  console.log();
}

export const ERROR_MESSAGES = {
  INVALID_PROJECT_NAME: {
    message: 'Invalid project name',
    suggestion: 'Use only letters, numbers, hyphens, and underscores. Cannot start or end with hyphen/dot.',
  },
  TEMPLATE_NOT_FOUND: (name: string) => ({
    message: `Template "${name}" not found`,
    suggestion: 'Run "codescaffold list" to see available templates',
  }),
  PATH_TRAVERSAL: {
    message: 'Path traversal is not allowed',
    suggestion: 'Use a relative or absolute path within your workspace',
  },
  PROTECTED_DIRECTORY: {
    message: 'Cannot write to protected system directory',
    suggestion: 'Choose a different output directory',
  },
  DIRECTORY_EXISTS: (name: string) => ({
    message: `Directory "${name}" already exists`,
    suggestion: 'Use --force to overwrite, or choose a different project name',
  }),
  OPENAI_NOT_CONFIGURED: {
    message: 'OpenAI API key not configured',
    suggestion: 'Set OPENAI_API_KEY environment variable for AI-powered analysis',
  },
};
