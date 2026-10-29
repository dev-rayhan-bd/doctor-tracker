import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { RequestHandler } from 'express';
import { logger } from '@/utils/logger';

/**
 * 1. Helmet Custom Content Security Policy & Security Headers
 * Configured with permissive CDN/Worker directives for Redocly & Swagger documentation.
 */
export const helmetSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.redoc.ly',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
      ],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * 2. HTTP Parameter Pollution (HPP) Prevention
 */
export const hppProtection = hpp({
  whitelist: ['role', 'status', 'page', 'limit', 'sort', 'search', 'fields'],
});

/**
 * 3. NoSQL Injection Sanitizer (express-mongo-sanitize)
 */
export const mongoSanitizer = mongoSanitize({
  allowDots: false,
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn({ ip: req.ip, key }, 'NoSQL Injection attempt detected and sanitized');
  },
}) as unknown as RequestHandler;

/**
 * 4. Strict CORS Security Configuration
 */
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://doctor-tracker-frontend-alpha.vercel.app',
];

const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS || '';
  if (envOrigins) {
    const parsed = envOrigins
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean);
    return Array.from(new Set([...defaultAllowedOrigins, ...parsed]));
  }
  return defaultAllowedOrigins;
};

export const corsSecurity = cors({
  origin: (origin, callback) => {
    // Allow non-browser client requests (e.g. Postman, curl, server-to-server) where origin is undefined
    if (!origin) return callback(null, true);

    const allowed = getAllowedOrigins();
    const sanitizedOrigin = origin.trim().replace(/\/$/, '');

    if (allowed.includes(sanitizedOrigin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
});
