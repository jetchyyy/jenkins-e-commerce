import { NextFunction, Request, Response } from 'express';
import { forbidden, unauthorized } from '../utils/http.js';
import { AuthRole } from './auth.js';

export const requireRole = (roles: AuthRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(forbidden('Insufficient permissions'));
    }

    return next();
  };
};
