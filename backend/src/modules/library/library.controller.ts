import { Request, Response } from 'express';
import { badRequest } from '../../utils/http.js';
import { generateLibraryDownload, getOwnedBookStream, getUserLibrary, getUserOrders } from './library.service.js';

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

  stream: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const file = await getOwnedBookStream(req.user.id, req.params.bookId);
    const safeTitle = file.title.replace(/[^a-zA-Z0-9._-]/g, '-');

    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${safeTitle}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(file.bytes);
  },

  orders: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const orders = await getUserOrders(req.user.id);
    res.json({ orders });
  }
};
