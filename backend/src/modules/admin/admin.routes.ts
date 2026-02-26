import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { adminController } from './admin.controller.js';
import { booksController } from '../books/books.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, requireRole(['superadmin']));

adminRoutes.post('/books', asyncHandler(booksController.create));
adminRoutes.put('/books/:id', asyncHandler(booksController.update));
adminRoutes.post('/books/:id/upload', asyncHandler(booksController.upload));
adminRoutes.get('/analytics', asyncHandler(adminController.analytics));
adminRoutes.get('/orders', asyncHandler(adminController.orders));
