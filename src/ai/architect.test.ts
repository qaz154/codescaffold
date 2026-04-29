import { describe, it, expect } from 'vitest';
import { recommendArchitecture, ArchitectureRecommendation } from './architect';
import { AnalysisResult } from './analyzer';

describe('recommendArchitecture', () => {
  const baseAnalysis: AnalysisResult = {
    projectType: 'express-api',
    features: [],
    database: 'postgresql',
    auth: false,
    api: true,
    ui: false,
    docker: true,
    ci: true,
  };

  it('should recommend Express architecture for express-api', () => {
    const result = recommendArchitecture(baseAnalysis);
    expect(result.techStack.backend).toBe('Express.js');
    expect(result.techStack.orm).toBe('Prisma');
    expect(result.dockerConfig.port).toBe(8080);
  });

  it('should recommend Next.js architecture for nextjs-fullstack', () => {
    const analysis = { ...baseAnalysis, projectType: 'nextjs-fullstack' as const, ui: true };
    const result = recommendArchitecture(analysis);
    expect(result.techStack.frontend).toBe('Next.js 15 (App Router)');
    expect(result.techStack.backend).toBe('Express.js');
    expect(result.dockerConfig.port).toBe(3000);
  });

  it('should recommend FastAPI architecture for python-fastapi', () => {
    const analysis = { ...baseAnalysis, projectType: 'python-fastapi' as const };
    const result = recommendArchitecture(analysis);
    expect(result.techStack.backend).toBe('FastAPI');
    expect(result.techStack.orm).toBe('SQLAlchemy');
    expect(result.dockerConfig.baseImage).toBe('python:3.11-slim');
    expect(result.dockerConfig.port).toBe(8000);
  });

  it('should recommend Go architecture for go-microservice', () => {
    const analysis = { ...baseAnalysis, projectType: 'go-microservice' as const };
    const result = recommendArchitecture(analysis);
    expect(result.techStack.backend).toContain('Go');
    expect(result.dockerConfig.baseImage).toBe('golang:1.22-alpine');
    expect(result.dockerConfig.port).toBe(8080);
  });

  it('should include all required directory structure entries', () => {
    const result = recommendArchitecture(baseAnalysis);
    expect(result.directoryStructure.length).toBeGreaterThan(0);
    expect(result.dependencies.production.length).toBeGreaterThan(0);
    expect(result.dependencies.development.length).toBeGreaterThan(0);
  });
});
