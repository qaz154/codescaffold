import { describe, it, expect } from 'vitest';
import { analyzeRequirements } from './analyzer.js';

describe('analyzeRequirements', () => {
  it('should detect Next.js fullstack project', () => {
    const result = analyzeRequirements('A Next.js fullstack app with user dashboard');
    expect(result.projectType).toBe('nextjs-fullstack');
    expect(result.ui).toBe(true);
  });

  it('should detect Express API project', () => {
    const result = analyzeRequirements('An Express REST API backend');
    expect(result.projectType).toBe('express-api');
  });

  it('should detect Python FastAPI project', () => {
    const result = analyzeRequirements('A Python FastAPI microservice');
    expect(result.projectType).toBe('python-fastapi');
  });

  it('should detect Go microservice project', () => {
    const result = analyzeRequirements('A Go microservice with gRPC');
    expect(result.projectType).toBe('go-microservice');
  });

  it('should detect authentication feature', () => {
    const result = analyzeRequirements('A user management system with login and registration');
    expect(result.features).toContain('auth');
    expect(result.auth).toBe(true);
  });

  it('should detect CRUD features', () => {
    const result = analyzeRequirements('A CRUD application for user management');
    expect(result.features).toContain('crud');
  });

  it('should default to postgresql', () => {
    const result = analyzeRequirements('A simple API');
    expect(result.database).toBe('postgresql');
  });

  it('should detect MySQL when specified', () => {
    const result = analyzeRequirements('An API with MySQL database');
    expect(result.database).toBe('mysql');
  });

  it('should always include docker and ci', () => {
    const result = analyzeRequirements('Any project');
    expect(result.docker).toBe(true);
    expect(result.ci).toBe(true);
  });

  it('should default to express-api for ambiguous requirements', () => {
    const result = analyzeRequirements('A backend service');
    expect(result.projectType).toBe('express-api');
  });
});
