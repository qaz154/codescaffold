import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging and ID tracing
app.use(requestLogger);

// Body parsing
app.use(express.json());

// Health check (no rate limit)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '{{PROJECT_NAME}}',
  });
});

// API routes with rate limiting
app.use('/api/users', apiLimiter, userRoutes);

// Auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, userRoutes);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { prisma };
