export interface TEMPLATE_VARIABLES {
  PROJECT_NAME: string;
  DESCRIPTION: string;
  AUTHOR: string;
  YEAR: string;
  DATABASE_URL: string;
}

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

export function replaceVariables(content: string, variables: TEMPLATE_VARIABLES): string {
  return content.replace(PLACEHOLDER_REGEX, (match, key) => {
    return variables[key as keyof TEMPLATE_VARIABLES] ?? match;
  });
}

export function getDefaultVariables(): TEMPLATE_VARIABLES {
  return {
    PROJECT_NAME: 'my-project',
    DESCRIPTION: 'A project generated with CodeScaffold',
    AUTHOR: 'Developer',
    YEAR: new Date().getFullYear().toString(),
    DATABASE_URL: 'postgresql://localhost:5432/dbname',
  };
}
