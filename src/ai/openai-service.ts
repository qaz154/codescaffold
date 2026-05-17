import { z } from 'zod';

const TEMPLATE_CHOICES = [
  'nextjs-fullstack',
  'express-api',
  'python-fastapi',
  'go-microservice',
] as const;

const DatabaseChoice = z.enum(['postgresql', 'mysql', 'sqlite']);
type DatabaseChoice = z.infer<typeof DatabaseChoice>;

export interface AIAnalysisResult {
  projectType: (typeof TEMPLATE_CHOICES)[number];
  database: DatabaseChoice;
  features: string[];
  reasoning: string;
}

export interface AIServiceConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
  provider?: 'openai' | 'claude' | 'local';
}

const DEFAULT_TIMEOUT_MS = 60000;

const AnalysisSchema = z.object({
  projectType: z.enum(TEMPLATE_CHOICES),
  database: DatabaseChoice,
  features: z.array(z.string()),
  reasoning: z.string(),
});

const SYSTEM_PROMPT = `You are an expert software architect analyzing project requirements.
Based on the user's natural language description, you must analyze and determine:

1. **projectType**: The best template for the project:
   - "nextjs-fullstack": For web apps with frontend UI using React/Next.js
   - "express-api": For backend REST APIs only
   - "python-fastapi": For Python-based APIs
   - "go-microservice": For Go-based microservices

2. **database**: The most suitable database:
   - "postgresql": Default for most applications
   - "mysql": When explicitly mentioned or for MySQL-specific requirements
   - "sqlite": For simple projects or prototyping

3. **features**: Key features needed (choose from: auth, crud, websocket, file-upload, email, payment, admin-dashboard, api-rest, graphql, caching, logging) or custom features based on the description.

4. **reasoning**: Brief explanation of why you made these choices.

Respond in JSON format only.`;

const USER_PROMPT_TEMPLATE = `Analyze this project requirement and respond with JSON:

Requirement: {requirement}

Respond with this exact JSON structure:
{
  "projectType": "template-name",
  "database": "postgresql|mysql|sqlite",
  "features": ["feature1", "feature2"],
  "reasoning": "brief explanation"
}`;

export class AIService {
  private openAIClient: import('openai').default | null = null;
  private anthropicClient: import('@anthropic-ai/sdk').default | null = null;
  private apiKey: string | null = null;
  private provider: 'openai' | 'claude' | 'local' = 'openai';
  private model: string = 'gpt-4o-mini';

  constructor(config: AIServiceConfig = {}) {
    this.provider = config.provider || this.detectProvider();
    this.model = config.model || this.getDefaultModel();
    this.apiKey = config.apiKey || this.getApiKey();

    if (this.apiKey || this.provider === 'local') {
      this.initializeClient(config);
    }
  }

  private detectProvider(): 'openai' | 'claude' | 'local' {
    const env = process.env;
    if (env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY) return 'claude';
    if (env.OPENAI_API_KEY) return 'openai';
    if (env.OLLAMA_BASE_URL || env.LOCAL_LLM_URL) return 'local';
    return 'openai';
  }

  private getDefaultModel(): string {
    switch (this.provider) {
      case 'claude':
        return 'claude-3-5-haiku-20241022';
      case 'local':
        return 'llama3.1';
      default:
        return 'gpt-4o-mini';
    }
  }

  private getApiKey(): string | null {
    const env = process.env;
    switch (this.provider) {
      case 'claude':
        return env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY || null;
      case 'openai':
        return env.OPENAI_API_KEY || null;
      default:
        return null;
    }
  }

  private initializeClient(config: AIServiceConfig): void {
    if (this.provider === 'claude') {
      // Use real Anthropic SDK
      const Anthropic = require('@anthropic-ai/sdk').default;
      this.anthropicClient = new Anthropic({
        apiKey: this.apiKey || undefined,
        timeout: config.timeout || DEFAULT_TIMEOUT_MS,
      });
    } else if (this.provider === 'local') {
      // Local LLM via OpenAI-compatible API
      const OpenAI = require('openai').default;
      this.openAIClient = new OpenAI({
        apiKey: 'ollama',
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
        timeout: config.timeout || DEFAULT_TIMEOUT_MS,
      });
    } else {
      // OpenAI
      const OpenAI = require('openai').default;
      this.openAIClient = new OpenAI({
        apiKey: this.apiKey || undefined,
        baseURL: config.baseURL,
        timeout: config.timeout || DEFAULT_TIMEOUT_MS,
      });
    }
  }

  isConfigured(): boolean {
    return this.anthropicClient !== null || this.openAIClient !== null;
  }

  getProviderInfo(): { provider: string; model: string } {
    return { provider: this.provider, model: this.model };
  }

  async analyzeRequirements(requirement: string): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'AI service not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.'
      );
    }

    const userPrompt = USER_PROMPT_TEMPLATE.replace('{requirement}', requirement);

    try {
      if (this.anthropicClient) {
        return await this.analyzeWithClaude(userPrompt);
      } else if (this.openAIClient) {
        return await this.analyzeWithOpenAI(userPrompt);
      } else {
        throw new Error('No AI client initialized');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `AI response validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  private async analyzeWithOpenAI(userPrompt: string): Promise<AIAnalysisResult> {
    const response = await this.openAIClient!.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI service');
    }

    const parsed = JSON.parse(content);
    const result = AnalysisSchema.parse(parsed);

    return {
      projectType: result.projectType,
      database: result.database,
      features: result.features,
      reasoning: result.reasoning,
    };
  }

  private async analyzeWithClaude(userPrompt: string): Promise<AIAnalysisResult> {
    const response = await this.anthropicClient!.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('No response from AI service');
    }

    const parsed = JSON.parse(content.text);
    const result = AnalysisSchema.parse(parsed);

    return {
      projectType: result.projectType,
      database: result.database,
      features: result.features,
      reasoning: result.reasoning,
    };
  }

  async analyzeRequirementWithPrompt<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error(
        'AI service not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.'
      );
    }

    try {
      if (this.anthropicClient) {
        return await this.analyzePromptWithClaude(systemPrompt, userPrompt, schema);
      } else if (this.openAIClient) {
        return await this.analyzePromptWithOpenAI(systemPrompt, userPrompt, schema);
      } else {
        throw new Error('No AI client initialized');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `AI response validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  }

  private async analyzePromptWithOpenAI<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const response = await this.openAIClient!.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI service');
    }

    const parsed = JSON.parse(content);
    return schema.parse(parsed);
  }

  private async analyzePromptWithClaude<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const response = await this.anthropicClient!.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('No response from AI service');
    }

    const parsed = JSON.parse(content.text);
    return schema.parse(parsed);
  }
}

let aiServiceInstance: AIService | null = null;

export function getAIService(config?: AIServiceConfig): AIService {
  if (!aiServiceInstance || config) {
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

export function resetAIService(): void {
  aiServiceInstance = null;
}
