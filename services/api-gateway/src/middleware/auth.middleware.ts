import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, optionalAuth, UserRole } from '@mallify/shared';
import { createLogger } from '@mallify/shared';

const logger = createLogger('api-gateway-auth');

// Export authentication middlewares from shared package
export { authenticate, authorize, optionalAuth };

// Route-based authentication configuration
export const publicRoutes = [
  '/health',
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/facebook',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/users/login', // User login endpoint
  '/users/register', // User registration endpoint
  '/products', // Browse products (GET only)
  '/boutiques', // Browse boutiques (GET only)
  '/promotions/active', // View active promotions
  '/drivers/applications', // Submit driver application
  '/boutiques/applications', // Submit boutique application
];

// Routes that allow optional authentication (public but enhanced with auth)
export const optionalAuthRoutes = [
  '/products',
  '/boutiques',
  '/reviews',
];

// Admin-only routes
export const adminRoutes = [
  '/analytics',
  '/audit',
  '/users/admin',
];

// Boutique owner routes
export const boutiqueOwnerRoutes = [
  '/boutiques/:id/products',
  '/boutiques/:id/orders',
  '/boutiques/:id/analytics',
];

// Driver routes
export const driverRoutes = [
  '/drivers/me',
  '/deliveries/assigned',
];

/**
 * Check if a route matches any pattern in the list
 */
const matchesRoute = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    // Convert pattern to regex (handle :id style params)
    const regexPattern = pattern
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  });
};

/**
 * Smart authentication middleware that applies rules based on route
 */
export const smartAuth = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  const method = req.method.toUpperCase();

  logger.debug(`Smart auth check: ${method} ${path}`);
  
  // Log for debugging
  logger.debug(`Checking if '${path}' matches publicRoutes: ${matchesRoute(path, publicRoutes)}`);

  // Public routes - no authentication required
  if (matchesRoute(path, publicRoutes)) {
    logger.debug(`${path} matched publicRoutes - allowing without auth`);
    // Allow GET requests to product/boutique routes without auth
    if ((path.startsWith('/products') || path.startsWith('/boutiques')) && method === 'GET') {
      return optionalAuth(req, res, next);
    }
    return next();
  }

  // Optional auth routes
  if (matchesRoute(path, optionalAuthRoutes) && method === 'GET') {
    return optionalAuth(req, res, next);
  }

  // All other routes require authentication
  logger.debug(`${path} requires authentication`);
  return authenticate(req, res, next);
};

/**
 * Role-based authorization middleware
 */
export const roleAuth = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;

  // Admin routes
  if (matchesRoute(path, adminRoutes)) {
    return authorize(UserRole.ADMIN)(req, res, next);
  }

  // Boutique owner routes
  if (matchesRoute(path, boutiqueOwnerRoutes)) {
    return authorize(UserRole.ADMIN, UserRole.BOUTIQUE_OWNER)(req, res, next);
  }

  // Driver routes
  if (matchesRoute(path, driverRoutes)) {
    return authorize(UserRole.ADMIN, UserRole.DELIVERY_PERSON, UserRole.DELIVERY_MANAGER)(req, res, next);
  }

  // If no specific role requirement, allow authenticated user
  next();
};

/**
 * Log authentication events
 */
export const authLogger = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user) {
    logger.info(`Authenticated request: ${req.method} ${req.path}`, {
      userId: req.user.id,
      role: req.user.role,
      ip: req.ip,
    });
  }
  next();
};
