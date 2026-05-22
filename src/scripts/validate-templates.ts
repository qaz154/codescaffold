import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateProject } from '../template/generator.js';

interface TemplateCheck {
  template: string;
  name: string;
  requiredFiles: string[];
}

const TEMPLATE_CHECKS: TemplateCheck[] = [
  {
    template: 'express-api',
    name: 'express-check',
    requiredFiles: ['package.json', 'tsconfig.json', 'src/server.ts'],
  },
  {
    template: 'nextjs-fullstack',
    name: 'next-check',
    requiredFiles: ['package.json', 'next.config.ts', 'app/page.tsx'],
  },
  {
    template: 'go-microservice',
    name: 'go-check',
    requiredFiles: ['go.mod', 'cmd/server/main.go', 'internal/handlers/user.go'],
  },
  {
    template: 'python-fastapi',
    name: 'python-check',
    requiredFiles: ['pyproject.toml', 'app/main.py', 'tests/test_users.py'],
  },
];

async function validateTemplate(check: TemplateCheck, outputRoot: string): Promise<void> {
  const projectPath = await generateProject({
    name: check.name,
    description: 'Template validation project',
    author: 'CodeScaffold',
    template: check.template,
    output: outputRoot,
    force: true,
    useAi: false,
  });

  for (const relativeFile of check.requiredFiles) {
    const absoluteFile = path.join(projectPath, relativeFile);
    if (!fs.existsSync(absoluteFile)) {
      throw new Error(`Template validation failed for ${check.template}: missing ${relativeFile}`);
    }
  }
}

async function main(): Promise<void> {
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'codescaffold-template-validation-'));

  try {
    for (const check of TEMPLATE_CHECKS) {
      await validateTemplate(check, outputRoot);
    }

    console.log('Template validation passed.');
  } finally {
    fs.rmSync(outputRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
