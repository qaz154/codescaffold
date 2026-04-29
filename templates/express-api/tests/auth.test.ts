import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/userRoutes';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/v1/users', authRoutes);
app.use(errorHandler);

describe('User Routes', () => {
  describe('POST /register', () => {
    it('should require email', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require password', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require valid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require minimum password length', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ email: 'test@example.com', password: '12345' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /profile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });
  });
});
