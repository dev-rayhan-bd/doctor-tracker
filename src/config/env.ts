import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // REDIS_HOST: z.string().default('127.0.0.1'),
  // REDIS_PORT: z.coerce.number().default(6379),
  // REDIS_PASSWORD: z.string().optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(1, 'JWT_ACCESS_SECRET is required')
    .default('dev_super_secret_access_key'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1, 'JWT_REFRESH_SECRET is required')
    .default('dev_super_secret_refresh_key'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('365d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEYS: z.string().optional(),
  CLOUDINARY_SECRET_KEYS: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsedEnv.data;
