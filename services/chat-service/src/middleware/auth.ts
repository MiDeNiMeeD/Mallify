import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface ChatUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      chatUser?: ChatUser;
    }
  }
}

const extractFromJwt = (authHeader?: string): ChatUser | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as { id: string; email?: string; role?: string };
    if (!decoded?.id) return null;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
};

const extractFromGatewayHeaders = (req: Request): ChatUser | null => {
  const id = (req.headers['x-user-id'] || '').toString();
  if (!id) return null;
  return {
    id,
    email: (req.headers['x-user-email'] || '').toString() || undefined,
    role: (req.headers['x-user-role'] || '').toString() || undefined,
  };
};

export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const fromGateway = extractFromGatewayHeaders(req);
  const fromJwt = !fromGateway ? extractFromJwt(req.headers.authorization) : null;
  const user = fromGateway || fromJwt;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.chatUser = user;
  next();
};

export const optionalAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const fromGateway = extractFromGatewayHeaders(req);
  const fromJwt = !fromGateway ? extractFromJwt(req.headers.authorization) : null;
  const user = fromGateway || fromJwt;
  if (user) req.chatUser = user;
  next();
};
