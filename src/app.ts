import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';
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
const getSwaggerDocument = () => {
  const possiblePaths = [
    path.resolve(__dirname, './swagger.yaml'),
    path.resolve(__dirname, '../src/swagger.yaml'),
    path.resolve(process.cwd(), 'src/swagger.yaml'),
    path.resolve(process.cwd(), 'dist/swagger.yaml'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return YAML.parse(fs.readFileSync(p, 'utf8'));
      } catch {
        // continue
      }
    }
  }
  return {
    openapi: '3.0.0',
    info: { title: 'Doctor Tracker Portal API', version: '1.0.0' },
    paths: {},
  };
};

const swaggerDocument = getSwaggerDocument();

// Serve raw OpenAPI JSON specification for Redocly and external tools
const serveSwaggerJson = (_req: Request, res: Response) => {
  res.removeHeader('Content-Security-Policy');
  res.json(swaggerDocument);
};

app.get('/docs/swagger.json', serveSwaggerJson);
app.get('/swagger.json', serveSwaggerJson);

// Modern Interactive Redocly HTML Handler (handles /docs, /docs/, /redoc, /redoc/)
const renderRedocDocs = (_req: Request, res: Response) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

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
      #nav-banner {
        background-color: #0f172a;
        color: #f8fafc;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        position: sticky;
        top: 0;
        z-index: 9999;
      }
      #nav-banner a {
        color: #38bdf8;
        text-decoration: none;
        font-weight: 600;
        margin-left: 15px;
      }
      #nav-banner a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div id="nav-banner">
      <div>🩺 <strong>Doctor Tracker Portal API</strong> &bull; Interactive Redocly Documentation</div>
      <div>
        <a href="/api/docs">Switch to Swagger UI &rarr;</a>
        <a href="/docs/swagger.json" target="_blank">OpenAPI JSON &rarr;</a>
      </div>
    </div>

    <redoc spec-url="/docs/swagger.json"></redoc>

    <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.5/bundles/redoc.standalone.js"></script>
  </body>
</html>`);
};

app.get('/docs', renderRedocDocs);
app.get('/docs/', renderRedocDocs);
app.get('/redoc', renderRedocDocs);
app.get('/redoc/', renderRedocDocs);

// Swagger UI Explorer (handles /api/docs, /api/docs/)
app.use(
  '/api/docs',
  ((_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('Content-Security-Policy');
    next();
  }) as unknown as RequestHandler,
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
