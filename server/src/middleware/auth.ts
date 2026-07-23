// src/middleware/auth.ts
import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const protect = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({
        success: false,
        message: 'Not authorized, no token provided'
      }, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return c.json({
        success: false,
        message: 'User not found'
      }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({
      success: false,
      message: 'Not authorized, token failed'
    }, 401);
  }
};

export const authorize = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!roles.includes(user.role)) {
      return c.json({
        success: false,
        message: `Role ${user.role} is not authorized to access this route`
      }, 403);
    }
    
    await next();
  };
};