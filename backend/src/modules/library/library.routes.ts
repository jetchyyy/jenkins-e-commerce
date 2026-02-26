import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { libraryController } from './library.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const libraryRoutes = Router();

libraryRoutes.get('/', authMiddleware, asyncHandler(libraryController.list));
libraryRoutes.get('/:bookId/download', authMiddleware, asyncHandler(libraryController.download));
