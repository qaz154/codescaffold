import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export interface CommunityTemplate {
  name: string;
  source: string;
  description: string;
  version: string;
  lastUpdated: string;
  tags: string[];
}

export interface TemplateVersion {
  version: string;
  date: string;
  changes: string[];
}

const TEMPLATE_REGISTRY_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.codescaffold',
  'templates.json'
);

export function loadCommunityTemplates(): CommunityTemplate[] {
  try {
    if (fs.existsSync(TEMPLATE_REGISTRY_PATH)) {
      const data = fs.readFileSync(TEMPLATE_REGISTRY_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveCommunityTemplates(templates: CommunityTemplate[]): void {
  const dir = path.dirname(TEMPLATE_REGISTRY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TEMPLATE_REGISTRY_PATH, JSON.stringify(templates, null, 2));
}

export function addCommunityTemplate(template: CommunityTemplate): void {
  const templates = loadCommunityTemplates();
  const existing = templates.findIndex((t) => t.name === template.name);

  if (existing >= 0) {
    templates[existing] = template;
  } else {
    templates.push(template);
  }

  saveCommunityTemplates(templates);
  console.log(chalk.green(`✓ 模板 "${template.name}" v${template.version} 已添加`));
}

export function removeCommunityTemplate(name: string): boolean {
  const templates = loadCommunityTemplates();
  const filtered = templates.filter((t) => t.name !== name);

  if (filtered.length === templates.length) {
    return false;
  }

  saveCommunityTemplates(filtered);
  console.log(chalk.green(`✓ 模板 "${name}" 已移除`));
  return true;
}

export function updateTemplateVersion(name: string, version: string, changes: string[]): boolean {
  const templates = loadCommunityTemplates();
  const template = templates.find((t) => t.name === name);

  if (!template) {
    return false;
  }

  template.version = version;
  template.lastUpdated = new Date().toISOString().split('T')[0];

  saveCommunityTemplates(templates);
  console.log(chalk.green(`✓ 模板 "${name}" 已更新到 v${version}`));
  return true;
}

export function getTemplateVersions(name: string): TemplateVersion[] {
  const templates = loadCommunityTemplates();
  const template = templates.find((t) => t.name === name);

  if (!template) {
    return [];
  }

  // 从模板信息中提取版本历史（简化版本）
  return [
    {
      version: template.version,
      date: template.lastUpdated,
      changes: ['当前版本'],
    },
  ];
}

export function searchTemplates(query: string): CommunityTemplate[] {
  const templates = loadCommunityTemplates();
  const lowerQuery = query.toLowerCase();

  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function fetchTemplateFromGitHub(source: string): Promise<CommunityTemplate> {
  const parts = source.replace('github:', '').split('/');
  if (parts.length < 2) {
    throw new Error('无效的 GitHub 源格式，应为: github:user/repo');
  }

  const [owner, repo] = parts;

  // Validate GitHub naming rules
  const githubNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!githubNameRegex.test(owner) || owner.length < 1) {
    throw new Error('无效的 GitHub 用户名格式');
  }
  if (!githubNameRegex.test(repo) || repo.length < 1) {
    throw new Error('无效的 GitHub 仓库名格式');
  }

  const name = repo.replace('.git', '');

  return {
    name,
    source: `https://github.com/${owner}/${repo}.git`,
    description: `GitHub 模板: ${owner}/${repo}`,
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    tags: [],
  };
}

export function listCommunityTemplates(): CommunityTemplate[] {
  const templates = loadCommunityTemplates();

  if (templates.length === 0) {
    console.log(chalk.yellow('\n没有社区模板'));
    console.log(chalk.gray('使用以下命令添加模板:'));
    console.log(chalk.gray('  codescaffold template add github:user/repo'));
  } else {
    console.log(chalk.cyan('\n📦 社区模板:\n'));
    for (const t of templates) {
      console.log(`  ${chalk.bold(t.name)} ${chalk.cyan(`v${t.version}`)} - ${t.description}`);
      console.log(`  ${chalk.dim(t.source)}`);
      if (t.tags.length > 0) {
        console.log(`  ${chalk.dim('标签: ' + t.tags.join(', '))}`);
      }
    }
  }

  return templates;
}
