import chalk from 'chalk';

const TEMPLATE_NEXT_STEPS: Record<string, string[]> = {
  'nextjs-fullstack': ['npm install', 'npm run dev'],
  'express-api': ['npm install', 'npm run dev'],
  'python-fastapi': [
    'python -m venv venv',
    'source venv/bin/activate  # Windows: venv\\Scripts\\activate',
    'pip install -e ".[dev]"',
    'uvicorn app.main:app --reload',
  ],
  'go-microservice': ['go mod tidy', 'go run cmd/server/main.go'],
};

export function getTemplateNextSteps(template: string): string[] {
  return TEMPLATE_NEXT_STEPS[template] ?? ['npm install', 'npm run dev'];
}

export function printNextSteps(projectPath: string, template: string): void {
  console.log(chalk.green('\n✓ Next steps:'));
  console.log(chalk.gray(`  cd ${projectPath}`));

  for (const step of getTemplateNextSteps(template)) {
    console.log(chalk.gray(`  ${step}`));
  }

  console.log();
}
