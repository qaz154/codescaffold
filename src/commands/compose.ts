import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { handleCLIError } from '../utils/errors.js';
import {
  ComponentCategory,
  ComponentOption,
  ProjectConfig,
  frameworks,
  databases,
  auth,
  ui,
} from '../components/index.js';
import { loadPreferences, updatePreferences } from '../utils/preferences.js';
import {
  checkCompatibility,
  printCompatibilityResult,
  getRecommendedComponents,
} from '../components/dependencies.js';
import { printProjectPreview } from '../components/preview.js';

interface ComposeOptions {
  name?: string;
  minimal?: boolean;
  empty?: boolean;
  yes?: boolean;
  defaults?: boolean;
  output?: string;
  pkg?: string;
  currentDir?: boolean;
  preview?: boolean;
}

export async function composeCommand(options: ComposeOptions): Promise<void> {
  try {
    console.log(chalk.cyan('\nCodeScaffold Composable Project Builder\n'));

    const config = await buildConfig(options);
    displayConfig(config);
    printProjectPreview(config);

    if (options.preview) {
      showDryRunPreview(config);
      return;
    }

    if (!options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Create this project?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Cancelled'));
        return;
      }
    }

    await generateProject(config, options);
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

function showDryRunPreview(config: ProjectConfig): void {
  console.log(chalk.cyan('\nProject Preview (dry run, no files written)\n'));

  const tree: string[] = [];
  tree.push(`${chalk.bold(config.name)}/`);

  const isNode = config.framework.id !== 'fastapi' && config.framework.id !== 'go-gin';

  if (isNode) {
    tree.push('  package.json');
    tree.push('  tsconfig.json');
  }

  if (config.framework.id === 'fastapi') {
    tree.push('  pyproject.toml');
    tree.push('  app/');
    tree.push('    main.py');
    tree.push('    config.py');
    tree.push('  tests/');
  } else if (config.framework.id === 'go-gin') {
    tree.push('  go.mod');
    tree.push('  cmd/');
    tree.push('    server/');
    tree.push('      main.go');
    tree.push('  internal/');
    tree.push('    handlers/');
    tree.push('    models/');
  } else if (config.framework.id.startsWith('nextjs')) {
    tree.push('  app/');
    tree.push('    page.tsx');
    tree.push('    layout.tsx');
    tree.push('  components/');
    tree.push('  lib/');
  } else {
    tree.push('  src/');
    tree.push('    index.ts');
    tree.push('    routes/');
    tree.push('    middleware/');
  }

  if (config.database) {
    if (config.database.id.startsWith('prisma')) {
      tree.push('  prisma/');
      tree.push('    schema.prisma');
    }
  }

  tree.push('  .gitignore');
  tree.push('  .env.example');
  tree.push('  README.md');
  tree.push('  Dockerfile');
  tree.push('  docker-compose.yml');

  console.log(chalk.gray('File structure:'));
  for (const line of tree) {
    console.log(`  ${line}`);
  }

  console.log(chalk.gray('\nDependencies:'));
  if (config.framework.id.startsWith('nextjs')) {
    console.log(`  ${chalk.green('+')} next, react, react-dom`);
  } else if (config.framework.id === 'express-api') {
    console.log(`  ${chalk.green('+')} express, cors, helmet, dotenv`);
  } else if (config.framework.id === 'fastapi') {
    console.log(`  ${chalk.green('+')} fastapi, uvicorn, sqlalchemy, pydantic`);
  } else if (config.framework.id === 'go-gin') {
    console.log(`  ${chalk.green('+')} gin, pgx, jwt, uuid`);
  }

  if (config.database) {
    console.log(`  ${chalk.green('+')} ${config.database.name}`);
  }
  if (config.auth) {
    console.log(`  ${chalk.green('+')} ${config.auth.name}`);
  }
  if (config.ui) {
    console.log(`  ${chalk.green('+')} ${config.ui.name}`);
  }

  console.log(chalk.cyan('\nRun without --preview to create the project.\n'));
}

async function buildConfig(options: ComposeOptions): Promise<ProjectConfig> {
  const prefs = loadPreferences();
  let name = options.name;

  if (options.currentDir) {
    name = path.basename(process.cwd());
  }

  if (!name) {
    if (options.defaults) {
      name = 'my-project';
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: 'my-project',
          validate: input =>
            /^[a-zA-Z0-9_-]+$/.test(input) ||
            'Name can only contain letters, numbers, hyphens, and underscores',
        },
      ]);
      name = answer.name;
    }
  }

  let framework: ComponentOption;
  let database: ComponentOption | null = null;
  let authOption: ComponentOption | null = null;
  let uiOption: ComponentOption | null = null;

  if (options.defaults) {
    framework = frameworks.options[0];
    database = databases.options[0];
    authOption = auth.options[0];
    uiOption = ui.options[0];
  } else {
    framework = (await selectComponent(frameworks, prefs.lastFramework))!;
    if (!framework) {
      throw new Error('Framework is required');
    }

    if (!options.minimal && !options.empty) {
      database = await selectComponent(databases, prefs.lastDatabase, framework.id);
      authOption = await selectComponent(auth, prefs.lastAuth, framework.id);
      uiOption = await selectComponent(ui, prefs.lastUi, framework.id);

      const compatibility = checkCompatibility(
        framework.id,
        database?.id || null,
        authOption?.id || null,
        uiOption?.id || null
      );

      printCompatibilityResult(compatibility);

      if (!compatibility.compatible) {
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Compatibility issues detected. Continue anyway?',
            default: false,
          },
        ]);

        if (!proceed) {
          throw new Error('Cancelled by user');
        }
      }
    }
  }

  updatePreferences({
    lastFramework: framework.id,
    lastDatabase: database?.id,
    lastAuth: authOption?.id,
    lastUi: uiOption?.id,
  });

  return {
    name: name || 'my-project',
    framework,
    database,
    auth: authOption,
    ui: uiOption,
    features: [],
  };
}

async function selectComponent(
  category: ComponentCategory,
  lastChoice?: string,
  framework?: string
): Promise<ComponentOption | null> {
  const recommendations = framework ? getRecommendedComponents(framework) : null;
  const recommendedIds = recommendations?.[category.id as keyof typeof recommendations] || [];

  const choices: Array<{ name: string; value: ComponentOption | null }> = category.options.map(
    opt => {
      const isRecommended = recommendedIds.includes(opt.id);
      const name = isRecommended
        ? `${opt.name} - ${opt.description} ${chalk.green('(recommended)')}`
        : `${opt.name} - ${opt.description}`;
      return { name, value: opt };
    }
  );

  if (!category.required) {
    choices.push({ name: 'Skip', value: null });
  }

  const defaultIndex = lastChoice
    ? choices.findIndex(c => c.value && c.value.id === lastChoice)
    : -1;

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: `Select ${category.name}${lastChoice ? ' (press enter for previous choice)' : ''}:`,
      choices,
      default: defaultIndex >= 0 ? defaultIndex : 0,
    },
  ]);

  return answer.selected;
}

function displayConfig(config: ProjectConfig): void {
  console.log(chalk.cyan('\nProject Configuration:\n'));
  console.log(`  ${chalk.bold('Name:')} ${config.name}`);
  console.log(`  ${chalk.bold('Framework:')} ${chalk.green(config.framework.name)}`);

  if (config.database) {
    console.log(`  ${chalk.bold('Database:')} ${chalk.green(config.database.name)}`);
  }

  if (config.auth) {
    console.log(`  ${chalk.bold('Auth:')} ${chalk.green(config.auth.name)}`);
  }

  if (config.ui) {
    console.log(`  ${chalk.bold('UI:')} ${chalk.green(config.ui.name)}`);
  }
}

async function generateProject(config: ProjectConfig, options: ComposeOptions): Promise<void> {
  const { fastGenerate } = await import('../template/fast-generator.js');

  const projectPath = await fastGenerate({
    name: config.name,
    framework: config.framework.id,
    database: config.database?.id || 'none',
    auth: config.auth?.id || 'none',
    ui: config.ui?.id || 'none',
    output: options.output || '.',
  });

  console.log(chalk.green(`\nProject created: ${projectPath}\n`));
  console.log(chalk.gray('Next steps:'));
  console.log(chalk.gray(`  cd ${config.name}`));
  console.log(chalk.gray('  npm install'));
  console.log(chalk.gray('  npm run dev'));
}
