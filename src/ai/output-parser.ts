import { z } from 'zod';

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'prisma' | 'yaml' | 'json';
}

export interface SchemaUpdate {
  model: string;
  field: string;
  type: string;
  attributes?: string[];
}

export interface CodeGenerationResponse {
  files: GeneratedFile[];
  schemaUpdates?: SchemaUpdate[];
  imports?: string[];
  explanation?: string;
}

export const GeneratedFileSchema = z.object({
  path: z.string().min(1, 'File path is required'),
  content: z.string().min(1, 'File content is required'),
  language: z
    .enum(['typescript', 'javascript', 'python', 'go', 'prisma', 'yaml', 'json'])
    .optional(),
});

export const SchemaUpdateSchema = z.object({
  model: z.string(),
  field: z.string(),
  type: z.string(),
  attributes: z.array(z.string()).optional(),
});

export const CodeGenerationResponseSchema = z.object({
  files: z.array(GeneratedFileSchema),
  schemaUpdates: z.array(SchemaUpdateSchema).optional(),
  imports: z.array(z.string()).optional(),
  explanation: z.string().optional(),
});

export function parseLLMResponse(content: string): CodeGenerationResponse {
  let jsonStr = content.trim();

  // Remove markdown code blocks if present
  const codeBlockMatch = jsonStr.match(
    /```(?:json|typescript|ts|javascript|js|python|go|bash)?\s*([\s\S]*?)```/
  );
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try to parse as JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (error) {
    throw new Error(
      `Failed to parse LLM response as JSON: ${(error as Error).message}\nContent: ${jsonStr.slice(0, 500)}`
    );
  }

  // Validate with Zod
  const result = CodeGenerationResponseSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid LLM response structure: ${errors}`);
  }

  // Ensure language is always set on files
  const response: CodeGenerationResponse = {
    ...result.data,
    files: result.data.files.map(f => ({
      ...f,
      language: f.language || detectLanguageFromPath(f.path),
    })),
  };

  return response;
}

export function detectLanguageFromPath(filePath: string): GeneratedFile['language'] {
  const ext = filePath.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'py':
      return 'python';
    case 'go':
      return 'go';
    case 'prisma':
      return 'prisma';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'json':
      return 'json';
    default:
      return 'typescript';
  }
}

// Placeholder patterns that indicate incomplete code
const PLACEHOLDER_PATTERNS = [
  { pattern: /\bTODO\b/i, message: 'Contains TODO - code not complete' },
  { pattern: /\bFIXME\b/i, message: 'Contains FIXME - code needs fixing' },
  { pattern: /\bHACK\b/i, message: 'Contains HACK - workaround code' },
  { pattern: /\bXXX\b/i, message: 'Contains XXX - needs attention' },
  { pattern: /\.\.\./g, message: 'Contains ellipsis (...) - code truncated' },
  { pattern: /\bundefined\b(?![\w])/, message: 'Contains undefined value' },
  { pattern: /\bnull\b(?![\w])/, message: 'Contains null - may cause runtime errors' },
  { pattern: /\bconsole\.log\b/, message: 'Contains console.log - remove for production' },
  {
    pattern: /password\s*=\s*['"][^'"]+['"]/i,
    message: 'Contains hardcoded password - security risk',
  },
  { pattern: /secret\s*=\s*['"][^'"]+['"]/i, message: 'Contains hardcoded secret - security risk' },
  {
    pattern: /apiKey\s*=\s*['"][^'"]+['"]/i,
    message: 'Contains hardcoded API key - security risk',
  },
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  { pattern: /`.*\$\{.*\}.*`/g, message: 'Potential SQL injection - use parameterized queries' },
];

export function validateGeneratedCode(code: string, language: GeneratedFile['language']): string[] {
  const errors: string[] = [];

  // Check for placeholder/incomplete code patterns
  for (const { pattern, message } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  if (language === 'typescript' || language === 'javascript') {
    // Check for 'any' type usage
    const anyTypeMatches = code.match(/\b:\s*any\b|\bany\s*\[/);
    if (anyTypeMatches) {
      errors.push(`Uses 'any' type - use explicit types instead: ${anyTypeMatches[0]}`);
    }

    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
    }

    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
    }

    // Check for balanced brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
    }

    // Check for import/export statements (file should have at least one)
    if (!code.includes('import') && !code.includes('export')) {
      errors.push('No import/export statements - file may be incomplete');
    }
  }

  if (language === 'python') {
    // Check for balanced indentation (rough check)
    const indentLines = code.match(/^[\t ]+/gm);
    if (indentLines) {
      const indentLevels = new Map<string, number>();
      for (const line of indentLines) {
        const spaces = line.length;
        indentLevels.set('level_' + spaces, (indentLevels.get('level_' + spaces) || 0) + 1);
      }
      // Python should have consistent indentation (4 spaces typical)
      const maxIndent = Math.max(
        ...Array.from(indentLevels.keys()).map(k => parseInt(k.split('_')[1]))
      );
      if (maxIndent > 8) {
        errors.push(`Inconsistent or excessive indentation detected (max: ${maxIndent})`);
      }
    }
  }

  if (language === 'go') {
    // Check for package declaration
    if (!code.includes('package ')) {
      errors.push('Missing package declaration');
    }

    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
    }
  }

  // Check for SQL injection patterns (applicable to all languages)
  for (const { pattern, message } of SQL_INJECTION_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(message);
    }
  }

  // Check for suspicious patterns that might indicate hallucinated code
  if (code.length < 50) {
    errors.push('Code is suspiciously short - may be incomplete');
  }

  return errors;
}
