import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { checkoutController } from './checkout.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

export const checkoutRoutes = Router();

checkoutRoutes.post('/create-intent', authMiddleware, asyncHandler(checkoutController.createIntent));
checkoutRoutes.post('/mock/complete', authMiddleware, asyncHandler(checkoutController.completeMock));
