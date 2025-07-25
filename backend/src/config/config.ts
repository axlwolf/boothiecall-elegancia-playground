import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api/v1'),

  // Database Configuration
  DATABASE_URL: z.string(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('boothiecall_dev'),
  DB_USER: z.string().default('boothiecall'),
  DB_PASS: z.string(),

  // Redis Configuration
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // MinIO S3 Configuration
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().transform(Number).default('9000'),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z.string().transform(val => val === 'true').default('false'),
  MINIO_BUCKET_NAME: z.string().default('boothiecall-assets'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  ALLOWED_MIME_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SESSION_SECRET: z.string().min(32),

  // Multi-tenant Configuration
  DEFAULT_TENANT_ID: z.string().default('default'),
  TENANT_HEADER: z.string().default('x-tenant-id'),

  // Background Jobs Configuration
  QUEUE_REDIS_URL: z.string().optional(),
  QUEUE_NAME: z.string().default('boothiecall-jobs'),

  // Monitoring Configuration
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default('30000'),
  METRICS_ENABLED: z.string().transform(val => val === 'true').default('true'),

  // Development Configuration
  DEV_SEED_DATA: z.string().transform(val => val === 'true').default('false'),
  DEV_AUTO_MIGRATE: z.string().transform(val => val === 'true').default('false'),
  DEV_LOG_SQL: z.string().transform(val => val === 'true').default('false'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Export configuration object
export const config = {
  server: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },
  
  api: {
    version: env.API_VERSION,
    prefix: env.API_PREFIX,
  },

  database: {
    url: env.DATABASE_URL,
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASS,
  },

  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },

  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  storage: {
    endpoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    useSSL: env.MINIO_USE_SSL,
    bucketName: env.MINIO_BUCKET_NAME,
  },

  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedMimeTypes: env.ALLOWED_MIME_TYPES.split(','),
  },

  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
  },

  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    sessionSecret: env.SESSION_SECRET,
  },

  tenant: {
    defaultId: env.DEFAULT_TENANT_ID,
    header: env.TENANT_HEADER,
  },

  queue: {
    redisUrl: env.QUEUE_REDIS_URL || env.REDIS_URL,
    name: env.QUEUE_NAME,
  },

  monitoring: {
    healthCheckInterval: env.HEALTH_CHECK_INTERVAL,
    metricsEnabled: env.METRICS_ENABLED,
  },

  development: {
    seedData: env.DEV_SEED_DATA,
    autoMigrate: env.DEV_AUTO_MIGRATE,
    logSQL: env.DEV_LOG_SQL,
  },
} as const;

export type Config = typeof config;
