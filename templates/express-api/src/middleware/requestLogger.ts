import { Request, Response, NextFunction } from 'express';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[36m';

function formatTime(date: Date): string {
  return date.toISOString();
}

function getStatusColor(status: number): string {
  if (status >= 500) return RED;
  if (status >= 400) return YELLOW;
  if (status >= 300) return BLUE;
  return GREEN;
}

export interface RequestLogData {
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestId: string;
  userId?: string;
  ip: string;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function logRequest(data: RequestLogData): void {
  const { method, url, status, duration, requestId, userId, ip } = data;
  const timestamp = formatTime(new Date());

  const parts = [
    `[${timestamp}]`,
    `[${requestId}]`,
    `${method.padEnd(7)}`,
    url,
  ];

  if (status !== undefined) {
    parts.push(`${getStatusColor(status)}${status.toString().padEnd(3)}${RESET}`);
  }

  if (duration !== undefined) {
    parts.push(`${duration}ms`);
  }

  if (userId) {
    parts.push(`user:${userId}`);
  }

  parts.push(`ip:${ip}`);

  console.log(parts.join(' '));
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const startTime = Date.now();

  // Attach requestId to request object
  (req as any).requestId = requestId;
  (req as any).startTime = startTime;

  // Log request start
  logRequest({
    method: req.method,
    url: req.originalUrl || req.url,
    requestId,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.id;

    logRequest({
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      requestId,
      userId,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
    });
  });

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  next();
}
