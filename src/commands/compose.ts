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
}

export async function composeCommand(options: ComposeOptions): Promise<void> {
  try {
    console.log(chalk.cyan('\n📦 CodeScaffold 组件化创建\n'));

    const config = await buildConfig(options);
    displayConfig(config);
    printProjectPreview(config);

    // --yes 模式跳过确认
    if (!options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确认创建项目？',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('已取消'));
        return;
      }
    }

    await generateProject(config, options);
  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

async function buildConfig(options: ComposeOptions): Promise<ProjectConfig> {
  const prefs = loadPreferences();
  let name = options.name;

  // 当前目录模式
  if (options.currentDir) {
    name = path.basename(process.cwd());
  }

  if (!name) {
    // defaults 模式使用默认名称
    if (options.defaults) {
      name = 'my-project';
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '项目名称:',
          default: 'my-project',
          validate: input =>
            /^[a-zA-Z0-9_-]+$/.test(input) || '项目名称只能包含字母、数字、下划线和连字符',
        },
      ]);
      name = answer.name;
    }
  }

  // defaults 模式使用默认组件
  let framework: ComponentOption;
  let database: ComponentOption | null = null;
  let authOption: ComponentOption | null = null;
  let uiOption: ComponentOption | null = null;

  if (options.defaults) {
    framework = frameworks.options[0]; // Next.js App Router
    database = databases.options[0]; // Prisma PostgreSQL
    authOption = auth.options[0]; // NextAuth
    uiOption = ui.options[0]; // Tailwind + shadcn
  } else {
    framework = (await selectComponent(frameworks, prefs.lastFramework))!;
    if (!framework) {
      throw new Error('必须选择一个框架');
    }

    if (!options.minimal && !options.empty) {
      database = await selectComponent(databases, prefs.lastDatabase, framework.id);
      authOption = await selectComponent(auth, prefs.lastAuth, framework.id);
      uiOption = await selectComponent(ui, prefs.lastUi, framework.id);

      // 兼容性检查
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
            message: '存在兼容性问题，是否继续？',
            default: false,
          },
        ]);

        if (!proceed) {
          throw new Error('用户取消');
        }
      }
    }
  }

  // 保存偏好
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
  // 获取推荐组件
  const recommendations = framework ? getRecommendedComponents(framework) : null;
  const recommendedIds = recommendations?.[category.id as keyof typeof recommendations] || [];

  const choices: Array<{ name: string; value: ComponentOption | null }> = category.options.map(
    opt => {
      const isRecommended = recommendedIds.includes(opt.id);
      const name = isRecommended
        ? `${opt.name} - ${opt.description} ${chalk.green('(推荐)')}`
        : `${opt.name} - ${opt.description}`;
      return { name, value: opt };
    }
  );

  if (!category.required) {
    choices.push({ name: '跳过', value: null });
  }

  const defaultIndex = lastChoice
    ? choices.findIndex(c => c.value && c.value.id === lastChoice)
    : -1;

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: `选择${category.name}${lastChoice ? ' (回车使用上次选择)' : ''}:`,
      choices,
      default: defaultIndex >= 0 ? defaultIndex : 0,
    },
  ]);

  return answer.selected;
}

function displayConfig(config: ProjectConfig): void {
  console.log(chalk.cyan('\n📋 项目配置:\n'));
  console.log(`  ${chalk.bold('名称:')} ${config.name}`);
  console.log(`  ${chalk.bold('框架:')} ${chalk.green(config.framework.name)}`);

  if (config.database) {
    console.log(`  ${chalk.bold('数据库:')} ${chalk.green(config.database.name)}`);
  }

  if (config.auth) {
    console.log(`  ${chalk.bold('认证:')} ${chalk.green(config.auth.name)}`);
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

  console.log(chalk.green(`\n✅ 项目创建成功: ${projectPath}\n`));
  console.log(chalk.gray('下一步:'));
  console.log(chalk.gray(`  cd ${config.name}`));
  console.log(chalk.gray('  npm install'));
  console.log(chalk.gray('  npm run dev'));
}
