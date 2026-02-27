import { z } from 'zod';

export const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string(),
  description: z.string(),
  price_cents: z.number(),
  currency: z.string(),
  cover_url: z.string(),
  format: z.enum(['pdf', 'epub']),
  is_active: z.boolean().optional()
});

export type Book = z.infer<typeof bookSchema>;

