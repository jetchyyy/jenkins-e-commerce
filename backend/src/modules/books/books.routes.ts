import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { booksController } from './books.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const booksRoutes = Router();

booksRoutes.get('/', asyncHandler(booksController.list));
booksRoutes.get('/:id', asyncHandler(booksController.get));
booksRoutes.post('/:id/view', asyncHandler(booksController.trackView));

booksRoutes.post('/', authMiddleware, requireRole(['superadmin']), asyncHandler(booksController.create));
booksRoutes.put('/:id', authMiddleware, requireRole(['superadmin']), asyncHandler(booksController.update));
booksRoutes.delete('/:id', authMiddleware, requireRole(['superadmin']), asyncHandler(booksController.remove));
booksRoutes.post('/:id/upload', authMiddleware, requireRole(['superadmin']), asyncHandler(booksController.upload));
