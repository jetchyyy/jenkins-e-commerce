import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { libraryController } from './library.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const ordersRoutes = Router();

ordersRoutes.get('/', authMiddleware, asyncHandler(libraryController.orders));
