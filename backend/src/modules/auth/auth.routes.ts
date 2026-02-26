import { Router } from 'express';
import { env } from '../../config/env.js';
import { authMiddleware } from '../../middleware/auth.js';
import { bootstrapSuperadmin } from './bootstrapSuperadmin.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const authRoutes = Router();

authRoutes.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

authRoutes.post(
  '/system/bootstrap',
  asyncHandler(async (req, res) => {
    if (!env.BOOTSTRAP_TOKEN || req.header('x-bootstrap-token') !== env.BOOTSTRAP_TOKEN) {
      return res.status(401).json({ error: 'Invalid bootstrap token' });
    }

    await bootstrapSuperadmin();
    return res.json({ ok: true });
  })
);
