import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1),
  price_cents: z.number().int().positive(),
  currency: z.string().default('PHP'),
  cover_url: z.string().url().or(z.literal('')).default(''),
  format: z.enum(['pdf', 'epub']),
  is_active: z.boolean().default(true)
});

export const updateBookSchema = createBookSchema.partial();

const directPathSchema = z.object({
  file_path: z.string().min(1),
  format: z.enum(['pdf', 'epub'])
});

const base64UploadSchema = z.object({
  file_base64: z.string().min(1),
  file_name: z.string().min(1),
  format: z.enum(['pdf', 'epub'])
});

export const uploadBookFileSchema = z.union([directPathSchema, base64UploadSchema]);

export const uploadBookCoverSchema = z.object({
  file_base64: z.string().min(1),
  file_name: z.string().min(1),
  content_type: z.enum(['image/webp', 'image/jpeg', 'image/png'])
});
