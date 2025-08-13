import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { tenantMiddleware } from './middleware/tenant';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { assetsRouter } from './routes/assets';
import { sessionsRouter } from './routes/sessions';
import { filtersRouter } from './routes/filters';
import { analyticsRouter } from './routes/analytics';
import { adminRouter } from './routes/admin';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin.split(','),
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check (no auth required)
app.use('/health', healthRouter);

// Public routes (no auth required)
app.use(`${config.api.prefix}/auth`, authRouter);

// Protected routes (auth required)
app.use(`${config.api.prefix}/assets`, authMiddleware, tenantMiddleware, assetsRouter);
app.use(`${config.api.prefix}/sessions`, authMiddleware, tenantMiddleware, sessionsRouter);
app.use(`${config.api.prefix}/filters`, authMiddleware, tenantMiddleware, filtersRouter);
app.use(`${config.api.prefix}/analytics`, authMiddleware, tenantMiddleware, analyticsRouter);
app.use(`${config.api.prefix}/admin`, authMiddleware, tenantMiddleware, adminRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    const port = config.server.port;
    
    app.listen(port, () => {
      logger.info(`🚀 BoothieCall Backend API started successfully`);
      logger.info(`📡 Server running on port ${port}`);
      logger.info(`🌍 Environment: ${config.server.nodeEnv}`);
      logger.info(`📋 API Version: ${config.api.version}`);
      logger.info(`🔗 API Prefix: ${config.api.prefix}`);
      
      if (config.server.nodeEnv === 'development') {
        logger.info(`🏥 Health Check: http://localhost:${port}/health`);
        logger.info(`📚 API Docs: http://localhost:${port}${config.api.prefix}/docs`);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
