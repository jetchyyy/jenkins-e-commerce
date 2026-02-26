import { Request, Response } from 'express';
import { badRequest } from '../../utils/http.js';
import { generateLibraryDownload, getUserLibrary, getUserOrders } from './library.service.js';

export const libraryController = {
  list: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const library = await getUserLibrary(req.user.id);
    res.json({ library });
  },

  download: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const download = await generateLibraryDownload(req.user.id, req.params.bookId);
    res.json(download);
  },

  orders: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const orders = await getUserOrders(req.user.id);
    res.json({ orders });
  }
};
