export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  configFiles?: Record<string, string>;
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  options: ComponentOption[];
}

export interface ProjectConfig {
  name: string;
  framework: ComponentOption;
  database: ComponentOption | null;
  auth: ComponentOption | null;
  ui: ComponentOption | null;
  features: string[];
}
