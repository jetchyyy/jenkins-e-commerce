import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest, notFound } from '../../utils/http.js';

const PRIVATE_BOOKS_BUCKET = 'books-private';
const COVER_BUCKET = 'book-covers';

export const listActiveBooks = async () => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .select('id,title,author,description,price_cents,currency,cover_url,format,is_active,created_at,updated_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return (data ?? []).map((book) => ({
    ...book,
    cover_url: resolveCoverUrl(book.cover_url)
  }));
};

export const getBookById = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .select('id,title,author,description,price_cents,currency,cover_url,format,is_active,created_at,updated_at')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw notFound('Book not found');
  }

  return {
    ...data,
    cover_url: resolveCoverUrl(data.cover_url)
  };
};

export const trackBookView = async (bookId: string) => {
  const { error } = await supabaseAdmin.from('book_views').insert({ book_id: bookId });

  if (error) {
    throw badRequest(error.message);
  }

  return { ok: true };
};

export const createBook = async (payload: Record<string, unknown>) => {
  const { data, error } = await supabaseAdmin.from('books').insert(payload).select('*').single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to create book');
  }

  return data;
};

export const updateBook = async (id: string, payload: Record<string, unknown>) => {
  const { data, error } = await supabaseAdmin.from('books').update(payload).eq('id', id).select('*').single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to update book');
  }

  return data;
};

export const deleteBook = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .update({ is_active: false })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to delete book');
  }

  return data;
};

const persistFilePath = async (id: string, filePath: string, format: 'pdf' | 'epub') => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .update({ file_path: filePath, format })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to update book file');
  }

  return data;
};

export const uploadBookBinary = async (id: string, format: 'pdf' | 'epub', fileName: string, fileBase64: string) => {
  await ensurePrivateBooksBucket();
  const path = `books/${id}/${Date.now()}-${fileName}`;
  const buffer = Buffer.from(fileBase64, 'base64');

  const { error: uploadError } = await supabaseAdmin.storage.from(PRIVATE_BOOKS_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: format === 'pdf' ? 'application/pdf' : 'application/epub+zip'
  });

  if (uploadError) {
    throw badRequest(uploadError.message);
  }

  return persistFilePath(id, path, format);
};

export const updateBookFile = async (id: string, filePath: string, format: 'pdf' | 'epub') => {
  return persistFilePath(id, filePath, format);
};

export const uploadBookCoverBinary = async (id: string, fileName: string, fileBase64: string, contentType: 'image/webp' | 'image/jpeg' | 'image/png') => {
  await ensureCoverBucket();
  const path = `covers/${id}/${Date.now()}-${sanitizeFileName(fileName)}`;
  const buffer = Buffer.from(fileBase64, 'base64');

  const { error: uploadError } = await supabaseAdmin.storage.from(COVER_BUCKET).upload(path, buffer, {
    upsert: true,
    contentType
  });

  if (uploadError) {
    throw badRequest(uploadError.message);
  }

  const { data, error } = await supabaseAdmin
    .from('books')
    .update({ cover_url: path })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to update book cover');
  }

  return {
    ...data,
    cover_url: resolveCoverUrl(data.cover_url)
  };
};

const resolveCoverUrl = (coverUrl: string) => {
  if (!coverUrl || /^https?:\/\//i.test(coverUrl)) {
    return coverUrl;
  }

  const { data } = supabaseAdmin.storage.from(COVER_BUCKET).getPublicUrl(coverUrl);
  return data.publicUrl;
};

const ensureCoverBucket = async () => {
  const { data: existing, error: existingError } = await supabaseAdmin.storage.getBucket(COVER_BUCKET);
  if (!existingError && existing) {
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(COVER_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png']
  });

  if (createError && !createError.message.toLowerCase().includes('already')) {
    throw badRequest(createError.message);
  }
};

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

const ensurePrivateBooksBucket = async () => {
  const { data: existing, error: existingError } = await supabaseAdmin.storage.getBucket(PRIVATE_BOOKS_BUCKET);
  if (!existingError && existing) {
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(PRIVATE_BOOKS_BUCKET, {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['application/pdf', 'application/epub+zip']
  });

  if (createError && !createError.message.toLowerCase().includes('already')) {
    throw badRequest(createError.message);
  }
};
