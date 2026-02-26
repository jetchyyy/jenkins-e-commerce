import { Request, Response } from 'express';
import { createBookSchema, updateBookSchema, uploadBookFileSchema } from './books.validators.js';
import { createBook, getBookById, listActiveBooks, trackBookView, updateBook, updateBookFile, uploadBookBinary } from './books.service.js';

export const booksController = {
  list: async (_req: Request, res: Response) => {
    const books = await listActiveBooks();
    res.json({ books });
  },

  get: async (req: Request, res: Response) => {
    const book = await getBookById(req.params.id);
    res.json({ book });
  },

  trackView: async (req: Request, res: Response) => {
    const result = await trackBookView(req.params.id);
    res.status(201).json(result);
  },

  create: async (req: Request, res: Response) => {
    const payload = createBookSchema.parse(req.body);
    const book = await createBook(payload);
    res.status(201).json({ book });
  },

  update: async (req: Request, res: Response) => {
    const payload = updateBookSchema.parse(req.body);
    const book = await updateBook(req.params.id, payload);
    res.json({ book });
  },

  upload: async (req: Request, res: Response) => {
    const payload = uploadBookFileSchema.parse(req.body);

    if ('file_base64' in payload) {
      const book = await uploadBookBinary(req.params.id, payload.format, payload.file_name, payload.file_base64);
      return res.json({ book });
    }

    const book = await updateBookFile(req.params.id, payload.file_path, payload.format);
    return res.json({ book });
  }
};
