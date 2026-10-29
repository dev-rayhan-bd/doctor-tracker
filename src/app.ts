import express, { Application, Request, Response, RequestHandler } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import pinoHttp from 'pino-http';
import { StatusCodes } from 'http-status-codes';
import {
  helmetSecurity,
  corsSecurity,
  mongoSanitizer,
  hppProtection,
} from '@/middlewares/security.middleware';
import { globalRateLimiter } from '@/config/rateLimit.config';
import notFound from '@/middlewares/notFound';
import { applicationRoutes } from '@/routes';
import { globalErrorHandler } from '@/middlewares/globalErrorHandler';
import { logger } from '@/utils/logger';
import { sendResponse } from '@/utils/sendResponse';

const app: Application = express();

/**
 * 1. Trust Proxy Configuration
 * Essential for accurate IP address detection behind reverse proxies (NGINX, Cloudflare, AWS ALB)
 * Prevents false 429 Rate Limit errors and IP spoofing.
 */
app.set('trust proxy', 1);

/**
 * 2. HTTP Header & CORS Security
 */
app.use(helmetSecurity);
app.use(corsSecurity);

/**
 * 3. Global Rate Limiter (In-Memory Store; Redis store commented out in rateLimit.config.ts)
 */
app.use(globalRateLimiter);

/**
 * 4. Strict Body Parsers (Payload Size Limiting - 10kb DOS Protection)
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * 5. Data Sanitization & Parameter Pollution Protection
 */
app.use(mongoSanitizer as unknown as RequestHandler);
app.use(hppProtection as unknown as RequestHandler);

/**
 * 6. Request Logging
 */
app.use(pinoHttp({ logger }));

/**
 * 7. Welcome & Health Check Routes
 */
app.get('/', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Welcome to Doctor Tracker Platform API',
    data: {
      version: '1.0.0',
      health: '/health',
      apiBase: '/api/v1',
    },
  });
});

app.get('/health', (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Doctor Tracker Platform API is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * 8. API Documentation (Redocly & Swagger)
 */
const file = fs.readFileSync(path.resolve(__dirname, './swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

// Serve raw OpenAPI JSON specification for Redocly and external tools
app.get('/docs/swagger.json', (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Serve Modern Redocly Interactive Documentation at /docs & /redoc
app.get(
  '/docs',
  helmet({ contentSecurityPolicy: false }) as unknown as RequestHandler,
  (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Doctor Tracker - Redocly API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="https://cdn-icons-png.flaticon.com/512/2966/2966327.png" />
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Roboto', sans-serif;
      }
    </style>
  </head>
  <body>
    <redoc spec-url="/docs/swagger.json" theme='{"colors":{"primary":{"main":"#2563eb"}}}'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
  },
);

app.get('/redoc', (_req: Request, res: Response) => {
  res.redirect('/docs');
});

// Swagger UI Explorer
app.use(
  '/api/docs',
  helmet({ contentSecurityPolicy: false }) as unknown as RequestHandler,
  ...(swaggerUi.serve as unknown as RequestHandler[]),
  swaggerUi.setup(swaggerDocument) as unknown as RequestHandler,
);

/**
 * 9. Application API Routes
 */
app.use('/api/v1', applicationRoutes);

/**
 * 10. 404 Not Found Middleware
 */
app.use(notFound);

/**
 * 11. Centralized Global Error Handler Middleware
 */
app.use(globalErrorHandler);

export default app;
