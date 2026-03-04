import { Request, Response } from 'express';
import { getAllOrders, getAllUsers, getAdminAnalytics } from './admin.analytics.service.js';

export const adminController = {
  analytics: async (_req: Request, res: Response) => {
    const analytics = await getAdminAnalytics();
    res.json(analytics);
  },

  orders: async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const search = req.query.search as string | undefined;
    const result = await getAllOrders(page, limit, search);
    res.json(result);
  },

  users: async (_req: Request, res: Response) => {
    const users = await getAllUsers();
    res.json({ users });
  }
};
