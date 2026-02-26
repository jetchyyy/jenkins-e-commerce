import { Request, Response } from 'express';
import { getAllOrders, getAdminAnalytics } from './admin.analytics.service.js';

export const adminController = {
  analytics: async (_req: Request, res: Response) => {
    const analytics = await getAdminAnalytics();
    res.json(analytics);
  },

  orders: async (_req: Request, res: Response) => {
    const orders = await getAllOrders();
    res.json({ orders });
  }
};
