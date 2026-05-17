import { z } from 'zod';

export interface PromptTemplate {
  key: string;
  description: string;
  supportedProjectTypes: string[];
  systemPrompt: string;
  userPromptTemplate: string;
  outputSchema: z.ZodSchema;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    key: 'user-management',
    description: 'Generate user management with auth (register, login, profile, roles)',
    supportedProjectTypes: ['express-api', 'nextjs-fullstack'],
    systemPrompt: `You are an expert Express.js backend developer specializing in TypeScript and Prisma ORM.

Your task: Generate complete, production-ready user management code with JWT authentication and role-based access control.

CHAIN-OF-THOUGHT:
1. Identify required endpoints: register, login, profile (get/update), admin user management
2. Design database schema with User model, role enum, proper indexes
3. Create input validation schemas using Zod
4. Implement password hashing with bcrypt (12 rounds)
5. Generate JWT tokens with 24h expiration
6. Build middleware for authentication and role verification
7. Wire up routes with proper middleware chain

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations outside JSON
2. ALL code must be complete and runnable - ZERO TODOs, ZERO placeholders
3. NEVER use 'any' type - use proper TypeScript types
4. NEVER hardcode secrets - use environment variables
5. Use async/await for all database operations
6. Include proper error handling with try/catch in every async function
7. NEVER generate duplicate code - if file exists, overwrite only what needs updating

CODE CONVENTIONS:
- Express Request/Response from 'express'
- Prisma from '@prisma/client'
- Auth types from '../middleware/auth' (AuthRequest interface)
- Zod for validation: import { z } from 'zod'
- Password hashing: import { hashPassword, verifyPassword } from '../utils/password'
- JWT: import { generateToken, verifyToken } from '../utils/jwt'
- bcrypt rounds: 12

EXAMPLE OUTPUT (valid JSON response):
{"files": [{"path": "src/controllers/userController.ts", "content": "import { Request, Response } from 'express';\nimport { z } from 'zod';\nimport { prisma } from '../lib/db';\nimport { hashPassword, verifyPassword } from '../utils/password';\nimport { generateToken } from '../utils/jwt';\n\nconst registerSchema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n  name: z.string().min(1),\n});\n\nexport async function register(req: Request, res: Response) {\n  try {\n    const data = registerSchema.parse(req.body);\n    const hashedPassword = await hashPassword(data.password);\n    const user = await prisma.user.create({\n      data: { ...data, password: hashedPassword },\n    });\n    const token = generateToken({ id: user.id, email: user.email, role: user.role });\n    res.status(201).json({ user: { id: user.id, email: user.email }, token });\n  } catch (error) {\n    if (error instanceof z.ZodError) {\n      return res.status(400).json({ error: error.errors });\n    }\n    res.status(500).json({ error: 'Registration failed' });\n  }\n}"}]}`,
    userPromptTemplate: `Generate user management code for an Express.js API.

Project context:
- Project name: {{PROJECT_NAME}}
- Database: PostgreSQL with Prisma ORM
- Auth: JWT with bcrypt password hashing
- Framework: Express.js with TypeScript
- Features required: {{FEATURES}}

ANALYSIS:
1. What endpoints are needed for these features?
2. What fields should the User model have?
3. What middleware is required?
4. What validation schemas are needed?

Generate:
1. src/controllers/userController.ts - All user CRUD operations
2. src/routes/userRoutes.ts - Express routes with auth middleware
3. Any middleware or utility files needed

Return JSON with files array.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
      schemaUpdates: z
        .array(
          z.object({
            model: z.string(),
            field: z.string(),
            type: z.string(),
            attributes: z.array(z.string()),
          })
        )
        .optional(),
    }),
  },

  {
    key: 'user-routes',
    description: 'Generate Express routes for user management',
    supportedProjectTypes: ['express-api'],
    systemPrompt: `You are an expert Express.js developer.

Generate ONLY Express route definitions with proper middleware chaining.

CHAIN-OF-THOUGHT:
1. List all routes needed: POST /register, POST /login, GET /profile, PUT /profile
2. Identify which routes need authentication middleware
3. Identify which routes need admin role middleware
4. Chain middleware correctly: auth first, then role check

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown formatting
2. ALL routes must be complete with proper HTTP methods and status codes
3. NEVER generate duplicate routes
4. Use router.METHOD() format

EXAMPLE OUTPUT:
{"files": [{"path": "src/routes/userRoutes.ts", "content": "import { Router } from 'express';\nimport { register, login, getProfile, updateProfile, listUsers, deleteUser } from '../controllers/userController';\nimport { authenticateToken } from '../middleware/auth';\n\nconst router = Router();\n\nrouter.post('/register', register);\nrouter.post('/login', login);\nrouter.get('/profile', authenticateToken, getProfile);\nrouter.put('/profile', authenticateToken, updateProfile);\n\n// Admin routes\nrouter.get('/', authenticateToken, listUsers);\nrouter.delete('/:id', authenticateToken, deleteUser);\n\nexport default router;"}]}`,
    userPromptTemplate: `Generate Express routes for user management.

Features: {{FEATURES}}
Project type: express-api

Routes needed:
- POST /register (public)
- POST /login (public)
- GET /profile (authenticated)
- PUT /profile (authenticated)
- GET / (admin only)
- DELETE /:id (admin only)

Return JSON with route file.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  },

  {
    key: 'crud-generator',
    description: 'Generate generic CRUD operations for any entity',
    supportedProjectTypes: ['express-api', 'nextjs-fullstack'],
    systemPrompt: `You are an expert backend developer specializing in TypeScript and Prisma ORM.

Generate complete CRUD operations for the specified entity.

CHAIN-OF-THOUGHT:
1. Identify entity fields from requirements
2. Design Prisma model with proper types and relations
3. Generate controller with: create, read (one + list with pagination), update, delete
4. Add query filtering and sorting options
5. Include proper error handling for each operation

CRITICAL RULES:
1. Return ONLY valid JSON
2. Include pagination (skip/take or cursor-based)
3. Include basic filtering (where clauses)
4. All async functions must have try/catch
5. NEVER use 'any' type

EXAMPLE OUTPUT:
{"files": [{"path": "src/controllers/itemController.ts", "content": "import { Request, Response } from 'express';\nimport { prisma } from '../lib/db';\nimport { z } from 'zod';\n\nconst createSchema = z.object({ name: z.string().min(1), description: z.string().optional() });\n\nexport async function listItems(req: Request, res: Response) {\n  try {\n    const { skip = 0, take = 20 } = req.query;\n    const items = await prisma.item.findMany({ skip: Number(skip), take: Number(take) });\n    res.json({ data: items, count: items.length });\n  } catch (error) {\n    res.status(500).json({ error: 'Failed to fetch items' });\n  }\n}"}]}`,
    userPromptTemplate: `Generate CRUD code for: {{ENTITY}}

Fields: {{FIELDS}}
Database: {{DATABASE}}

Generate controller and routes for:
- List with pagination
- Get by ID
- Create
- Update
- Delete

Return JSON with files array.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  },

  {
    key: 'schema',
    description: 'Generate Prisma database schema',
    supportedProjectTypes: ['express-api', 'nextjs-fullstack'],
    systemPrompt: `You are a database expert specializing in PostgreSQL and Prisma ORM.

Generate complete Prisma schema definitions.

CHAIN-OF-THOUGHT:
1. Define all models with required fields
2. Add appropriate @id, @default, @unique, @relation directives
3. Include proper indexes for frequently queried fields
4. Add @@map for table naming convention

CRITICAL RULES:
1. Return ONLY valid JSON with schema content
2. Use proper Prisma syntax
3. Include @@index for foreign keys and frequently queried fields
4. Use @default() for auto-generated values

EXAMPLE OUTPUT:
{"files": [{"path": "prisma/schema.prisma", "content": "model User {\n  id        String   @id @default(cuid())\n  email     String   @unique\n  name      String?\n  role      Role     @default(USER)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([email])\n}\n\nenum Role {\n  USER\n  ADMIN\n}"}]}`,
    userPromptTemplate: `Generate Prisma schema for:
{{ENTITIES}}

Database: {{DATABASE}}

Return JSON with schema file content.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  },

  {
    key: 'fastapi-auth',
    description: 'Generate FastAPI authentication endpoints',
    supportedProjectTypes: ['python-fastapi'],
    systemPrompt: `You are a Python FastAPI expert specializing in async patterns and JWT authentication.

Generate complete authentication endpoints with JWT, password hashing, and OAuth2.

CHAIN-OF-THOUGHT:
1. Create Pydantic schemas for login/register requests
2. Implement password hashing with passlib
3. Generate JWT tokens with python-jose
4. Create dependency functions for get_current_user
5. Build protected endpoints

CRITICAL RULES:
1. Return ONLY valid JSON
2. Use async def for all database operations
3. Use Pydantic models for request/response validation
4. Include proper HTTPException handling
5. NEVER hardcode secrets - use environment variables

EXAMPLE OUTPUT:
{"files": [{"path": "app/auth.py", "content": "from datetime import datetime, timedelta\nfrom jose import JWTError, jwt\nfrom passlib.context import CryptContext\nfrom .config import settings\n\npwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")\n\ndef verify_password(plain: str, hashed: str) -> bool:\n    return pwd_context.verify(plain, hashed)\n\ndef get_password_hash(password: str) -> str:\n    return pwd_context.hash(password)\n\ndef create_access_token(data: dict) -> str:\n    to_encode = data.copy()\n    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)\n    to_encode.update({\"exp\": expire})\n    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)"}]}`,
    userPromptTemplate: `Generate FastAPI auth code for:
{{FEATURES}}

Features needed: password hashing, JWT token creation/validation, login endpoint, register endpoint, dependency for current user

Return JSON with auth files.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  },

  {
    key: 'go-auth',
    description: 'Generate Go authentication handlers and middleware',
    supportedProjectTypes: ['go-microservice'],
    systemPrompt: `You are a Go expert specializing in Gin framework and JWT authentication.

Generate complete JWT authentication with middleware.

CHAIN-OF-THOUGHT:
1. Create password hashing with bcrypt (golang.org/x/crypto/bcrypt)
2. Implement JWT generation/validation with golang-jwt/jwt/v5
3. Build auth middleware for Gin
4. Create handler functions for login/register

CRITICAL RULES:
1. Return ONLY valid JSON
2. Use proper Go error handling
3. Return appropriate HTTP status codes
4. Use context for request-scoped values
5. NEVER hardcode secrets

EXAMPLE OUTPUT:
{"files": [{"path": "internal/auth/jwt.go", "content": "package auth\n\nimport (\n    \"time\"\n    \"github.com/golang-jwt/jwt/v5\"\n)\n\ntype Claims struct {\n    UserID string \`json:\"sub\"\`\n    Email  string \`json:\"email\"\`\n    Role   string \`json:\"role\"\`\n    jwt.RegisteredClaims\n}\n\nfunc GenerateToken(userID, email, role string) (string, error) {\n    claims := Claims{\n        UserID: userID,\n        Email:  email,\n        Role:   role,\n        RegisteredClaims: jwt.RegisteredClaims{\n            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),\n        },\n    }\n    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)\n    return token.SignedString(jwtSecret)\n}"}]}`,
    userPromptTemplate: `Generate Go auth code for:
{{FEATURES}}

Files needed: password hashing, JWT generation/validation, auth middleware, login/register handlers

Return JSON with auth files.`,
    outputSchema: z.object({
      files: z.array(
        z.object({
          path: z.string(),
          content: z.string(),
        })
      ),
    }),
  },
];

export function getPromptTemplate(key: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(p => p.key === key);
}

export function getPromptTemplatesForProject(projectType: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(p => p.supportedProjectTypes.includes(projectType));
}

export function renderUserPrompt(
  template: PromptTemplate,
  variables: Record<string, string>
): string {
  let prompt = template.userPromptTemplate;

  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return prompt;
}
