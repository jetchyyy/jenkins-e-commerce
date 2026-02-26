import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { badRequest } from '../../utils/http.js';
import { completeMockCheckout, createCheckoutIntent } from './checkout.service.js';

const createIntentSchema = z.object({
  book_ids: z.array(z.string().uuid()).min(1)
});

export const checkoutController = {
  createIntent: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const payload = createIntentSchema.parse(req.body);
    const intent = await createCheckoutIntent(req.user.id, req.user.email, payload.book_ids);

    res.json(intent);
  },

  completeMock: async (req: Request, res: Response) => {
    if (env.PAYMENT_MODE !== 'mock') {
      throw badRequest('Mock checkout not enabled');
    }

    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const payload = createIntentSchema.parse(req.body);
    const order = await completeMockCheckout(req.user.id, payload.book_ids);

    res.status(201).json({ order });
  }
};
