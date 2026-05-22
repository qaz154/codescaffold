import { generateProject } from '../template/generator.js';

export interface CopyOptions {
  projectName: string;
  description: string;
  template: string;
  output: string;
  force: boolean;
}

export async function copyTemplate(options: CopyOptions): Promise<string> {
  return generateProject({
    name: options.projectName,
    description: options.description,
    author: 'Developer',
    template: options.template,
    output: options.output,
    force: options.force,
    useAi: true,
  });
}

export function extractProjectName(requirement: string): string {
  const words = requirement
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .slice(0, 4);

  return normalizeProjectName(words.join('-')) || 'my-project';
}

export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\.+/g, '').replace(/-+/g, '-');
}
