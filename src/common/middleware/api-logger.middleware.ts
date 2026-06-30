import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('API');

const SENSITIVE_KEYS = [
  'password',
  'confirmPassword',
  'newPassword',
  'oldPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'otp',
  'otpCode',
];

function maskSensitiveData(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveData(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, any>>((acc, [key, val]) => {
      const shouldMask = SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey.toLowerCase()),
      );

      acc[key] = shouldMask ? '***' : maskSensitiveData(val);
      return acc;
    }, {});
  }

  return value;
}

function safeJson(value: any): string {
  try {
    const maskedValue = maskSensitiveData(value);
    const json = JSON.stringify(maskedValue);

    if (!json) return '';
    return json.length > 1000 ? `${json.slice(0, 1000)}...` : json;
  } catch {
    return '[unserializable]';
  }
}

export function apiLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const body = safeJson(req.body);

  logger.log(
    `[${requestId}] HIT ${method} ${url} from ${ip}${body ? ` body=${body}` : ''}`,
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
    const message = `[${requestId}] DONE ${method} ${url} status=${statusCode} ${duration}ms`;

    logger[level](message);
  });

  next();
}
