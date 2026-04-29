import OpenAI from 'openai';
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
  projectType: typeof TEMPLATE_CHOICES[number];
  database: DatabaseChoice;
  features: string[];
  reasoning: string;
}

export interface AIServiceConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
}

// Default timeout of 60 seconds for API calls
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
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor(config: AIServiceConfig = {}) {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        timeout: config.timeout || DEFAULT_TIMEOUT_MS,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.apiKey !== null;
  }

  async analyzeRequirements(requirement: string): Promise<AIAnalysisResult> {
    if (!this.client) {
      throw new Error(
        'AI service not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }

    const userPrompt = USER_PROMPT_TEMPLATE.replace('{requirement}', requirement);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`AI response validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
      }
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  async analyzeRequirementWithPrompt<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    if (!this.client) {
      throw new Error(
        'AI service not configured. Please set OPENAI_API_KEY environment variable.'
      );
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
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
      const result = schema.parse(parsed);

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`AI response validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`);
      }
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    aiServiceInstance = new AIService({ apiKey });
  }
  return aiServiceInstance;
}

export function resetAIService(): void {
  aiServiceInstance = null;
}
