import inquirer from 'inquirer';
import chalk from 'chalk';
import { handleCLIError } from '../utils/errors';
import {
  listCommunityTemplates,
  addCommunityTemplate,
  removeCommunityTemplate,
  fetchTemplateFromGitHub,
} from '../template/community';

interface TemplateOptions {
  list?: boolean;
  add?: string;
  remove?: string;
}

export async function templateCommand(options: TemplateOptions): Promise<void> {
  try {
    if (options.list) {
      listCommunityTemplates();
      return;
    }

    if (options.remove) {
      removeCommunityTemplate(options.remove);
      return;
    }

    if (options.add) {
      const template = await fetchTemplateFromGitHub(options.add);
      addCommunityTemplate(template);
      return;
    }

    // 交互式模式
    await interactiveTemplateManagement();

  } catch (error) {
    handleCLIError(error);
    process.exit(1);
  }
}

async function interactiveTemplateManagement(): Promise<void> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '模板管理:',
      choices: [
        { name: '查看所有模板', value: 'list' },
        { name: '添加模板', value: 'add' },
        { name: '移除模板', value: 'remove' },
        { name: '返回', value: 'back' },
      ],
    },
  ]);

  switch (action) {
    case 'list':
      listCommunityTemplates();
      break;
    case 'add': {
      const { source } = await inquirer.prompt([
        {
          type: 'input',
          name: 'source',
          message: '模板源 (github:user/repo):',
          validate: (input) => {
            if (!input.startsWith('github:')) {
              return '格式: github:user/repo';
            }
            return true;
          },
        },
      ]);
      const template = await fetchTemplateFromGitHub(source);
      addCommunityTemplate(template);
      break;
    }
    case 'remove': {
      const templates = listCommunityTemplates();
      if (templates.length === 0) return;

      const { name } = await inquirer.prompt([
        {
          type: 'list',
          name: 'name',
          message: '选择要移除的模板:',
          choices: templates.map((t) => ({ name: t.name, value: t.name })),
        },
      ]);
      removeCommunityTemplate(name);
      break;
    }
  }
}
