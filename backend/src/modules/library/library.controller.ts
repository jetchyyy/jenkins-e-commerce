import { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { badRequest, forbidden } from '../../utils/http.js';
import { generateLibraryDownload, getOwnedBookMeta, getOwnedBookStream, getReadingProgress, getUserLibrary, getUserOrders, upsertReadingProgress } from './library.service.js';

const progressSchema = z.object({
  last_page: z.number().int().min(1),
  total_pages: z.number().int().min(1),
  bookmarks: z.array(z.number().int().min(1)).max(500).default([]),
  last_location: z.string().min(1).optional(),
  bookmarks_cfi: z.array(z.string().min(1)).max(500).default([]),
  zoom: z.number().min(0.5).max(4),
  theme: z.enum(['paper', 'sepia', 'night']),
  renderer: z.enum(['canvas', 'native']).default('canvas')
});

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

    if (!env.ALLOW_LIBRARY_DOWNLOADS) {
      throw forbidden('Direct download is disabled. Use secure reader streaming.');
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
    const extension = file.format === 'epub' ? 'epub' : 'pdf';
    res.setHeader('Content-Disposition', `inline; filename="${safeTitle}.${extension}"`);
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.send(file.bytes);
  },

  meta: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const book = await getOwnedBookMeta(req.user.id, req.params.bookId);
    res.json({ book });
  },

  getProgress: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const progress = await getReadingProgress(req.user.id, req.params.bookId);
    res.json({ progress });
  },

  upsertProgress: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const payload = progressSchema.parse(req.body);
    const progress = await upsertReadingProgress(req.user.id, req.params.bookId, payload);
    res.json({ progress });
  },

  orders: async (req: Request, res: Response) => {
    if (!req.user) {
      throw badRequest('Authenticated user required');
    }

    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || '10', 10)));

    const { data: orders, count: total } = await getUserOrders(req.user.id, page, limit);
    res.json({ orders, total, page, limit });
  }
};
