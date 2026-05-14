// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createProxyMiddleware, RequestHandler as ProxyRequestHandler } from 'http-proxy-middleware';
import { createLogger } from '@mallify/shared';
import { errorHandler, notFoundHandler } from '@mallify/shared';
import { generalLimiter, authLimiter, createLimiter } from './middleware/rateLimiter';
import { smartAuth, roleAuth, authLogger } from './middleware/auth.middleware';
import { services, routeMap } from './config/services';
import { checkAllServices } from './utils/healthCheck';

const app: Application = express();
const PORT = process.env.PORT || 3000;
const logger = createLogger('api-gateway');

const trustProxyEnv = process.env.TRUST_PROXY;
if (trustProxyEnv === 'true') {
  app.set('trust proxy', true);
} else if (trustProxyEnv === 'false') {
  app.set('trust proxy', false);
} else {
  // ngrok/most local reverse-proxy setups have one hop before the app.
  app.set('trust proxy', 1);
}

// ============================================
// Middleware
// ============================================

// Security
app.use(helmet());

// Compression
app.use(compression());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive
    if (isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject origin
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Uploaded product images are embedded from browser pages on other localhost origins.
app.use('/api/products/uploads', (_req: Request, res: Response, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use('/api/boutiques/uploads', (_req: Request, res: Response, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use('/api/chat/uploads', (_req: Request, res: Response, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Request logging (before body parsing)
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Body parsing ONLY for non-proxy routes (health endpoints, etc.)
// Proxy routes will receive raw body
app.use('/health', express.json());
app.use('/health', express.urlencoded({ extended: true }));

// Rate limiting (applied globally but can be overridden per route).
// Chat is high-frequency (typing, read-receipts, message sends) so we exempt it
// from the gateway-wide limiter. chat-service can apply its own limits if needed.
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/chat/')) return next();
  return generalLimiter(req, res, next);
});

// ============================================
// Authentication & Authorization
// ============================================

// Apply smart authentication to all /api routes
app.use('/api', smartAuth);

// Log authenticated requests
app.use('/api', authLogger);

// Apply role-based authorization
app.use('/api', roleAuth);

// ============================================
// Health Check & Status
// ============================================

// Gateway health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Aggregated health check for all services
app.get('/health/services', async (_req: Request, res: Response) => {
  try {
    const servicesHealth = await checkAllServices();
    
    const allHealthy = Object.values(servicesHealth).every(
      (service) => service.status === 'healthy'
    );

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      gateway: 'api-gateway',
      services: servicesHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check services health',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================
// Service-specific rate limiters
// ============================================

// Apply stricter rate limiting to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply moderate rate limiting to create endpoints, but exempt high-frequency
// realtime traffic (chat messages, presence, read receipts) so users can type.
const SKIP_CREATE_LIMIT_PREFIXES = ['/api/chat/'];
app.use('/api/*/create', createLimiter);
app.post('/api/*', (req, res, next) => {
  if (SKIP_CREATE_LIMIT_PREFIXES.some((p) => req.path.startsWith(p))) return next();
  return createLimiter(req, res, next);
});

// ============================================
// Proxy Routes to Microservices
// ============================================

// Create proxy middleware for each route mapping
const wsProxies: ProxyRequestHandler[] = [];

Object.entries(routeMap).forEach(([path, serviceName]) => {
  const service = services[serviceName];

  if (!service) {
    logger.warn(`Service ${serviceName} not configured for path ${path}`);
    return;
  }

  const enableWs = path === '/api/chat';

  logger.info(`Configuring proxy: ${path} -> ${service.url}${enableWs ? ' (ws)' : ''}`);

  const proxy = createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout,
    ws: enableWs,
    onProxyReq: (proxyReq, req) => {
      // Forward original IP and headers
      proxyReq.setHeader('X-Forwarded-For', req.ip || '');
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
      proxyReq.setHeader('X-Forwarded-Host', req.get('host') || '');

      // Forward user info from authentication
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.id);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }

      // Log proxy request
      logger.debug(`Proxying ${req.method} ${req.path} -> ${service.url}${req.path}`);
    },
    onProxyRes: (proxyRes, req) => {
      logger.debug(`Proxy response ${req.method} ${req.path}: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(
        `Proxy error for ${req?.method || 'WS'} ${req?.url || req?.path || serviceName}: ${err.message}`
      );

      // For WebSocket upgrade errors, `res` is a Socket (no .status). Destroy it.
      const asAny = res as any;
      if (typeof asAny?.status === 'function') {
        asAny.status(503).json({
          success: false,
          message: `Service temporarily unavailable: ${serviceName}`,
          error: process.env.NODE_ENV === 'development' ? err.message : undefined,
          timestamp: new Date().toISOString(),
        });
      } else if (asAny && typeof asAny.destroy === 'function') {
        try {
          asAny.destroy();
        } catch {
          /* ignore */
        }
      }
    },
  });

  app.use(path, proxy);

  if (enableWs) wsProxies.push(proxy);
});

// ============================================
// Error Handling
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    const server = http.createServer(app);

    for (const proxy of wsProxies) {
      const upgrade = (proxy as any).upgrade;
      if (typeof upgrade === 'function') {
        server.on('upgrade', upgrade);
      }
    }

    server.listen(PORT, () => {
      logger.info(`API Gateway listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info('Configured services:');
      Object.entries(services).forEach(([name, config]) => {
        logger.info(`  - ${name}: ${config.url}`);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();
