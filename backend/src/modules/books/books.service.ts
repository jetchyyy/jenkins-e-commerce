import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest, notFound } from '../../utils/http.js';

const PRIVATE_BOOKS_BUCKET = 'books-private';

export const listActiveBooks = async () => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .select('id,title,author,description,price_cents,currency,cover_url,format,is_active,created_at,updated_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return data;
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

  return data;
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
