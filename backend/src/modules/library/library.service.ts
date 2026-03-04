import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest, forbidden, notFound } from '../../utils/http.js';

const PRIVATE_BOOKS_BUCKET = 'books-private';

const assertOwnsBook = async (userId: string, bookId: string) => {
  const { data: grant, error: grantError } = await supabaseAdmin
    .from('library')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (grantError) {
    throw badRequest(grantError.message);
  }

  if (!grant) {
    throw forbidden('You do not own this book');
  }
};

export const getUserLibrary = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('library')
    .select(
      `id, granted_at, book:books(id,title,author,description,price_cents,currency,cover_url,format,is_active), order:orders(id,status,created_at)`
    )
    .eq('user_id', userId)
    .order('granted_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return data;
};

export const getUserOrders = async (userId: string, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabaseAdmin
    .from('orders')
    .select('id,status,total_cents,payment_provider,payment_intent_id,created_at,order_items(id,book_id,price_cents)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw badRequest(error.message);
  }

  return { data: data ?? [], count: count ?? 0 };
};

export const generateLibraryDownload = async (userId: string, bookId: string) => {
  const { data: grant, error: grantError } = await supabaseAdmin
    .from('library')
    .select('id, order_id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (grantError) {
    throw badRequest(grantError.message);
  }

  if (!grant) {
    throw forbidden('You do not own this book');
  }

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('id,title,file_path,format,is_active')
    .eq('id', bookId)
    .single();

  if (bookError || !book) {
    throw notFound('Book not found');
  }

  if (!book.file_path) {
    throw badRequest('Book file is not available');
  }

  const { data, error } = await supabaseAdmin.storage
    .from(PRIVATE_BOOKS_BUCKET)
    .createSignedUrl(book.file_path, 60);

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed generating signed URL');
  }

  return {
    signed_url: data.signedUrl,
    expires_in_seconds: 60,
    watermark: {
      enabled: false,
      note: `Future-ready watermark placeholder: ${userId}:${grant.order_id}`
    }
  };
};

export const getOwnedBookStream = async (userId: string, bookId: string) => {
  await assertOwnsBook(userId, bookId);

  const { data: book, error: bookError } = await supabaseAdmin
    .from('books')
    .select('id,title,file_path,format,is_active')
    .eq('id', bookId)
    .single();

  if (bookError || !book) {
    throw notFound('Book not found');
  }

  if (!book.file_path) {
    throw badRequest('Book file is not available');
  }

  const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage.from(PRIVATE_BOOKS_BUCKET).download(book.file_path);

  if (downloadError || !fileBlob) {
    throw badRequest(downloadError?.message ?? 'Unable to load book file');
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const contentType = book.format === 'epub' ? 'application/epub+zip' : 'application/pdf';
  return {
    title: book.title,
    contentType,
    format: book.format,
    bytes: Buffer.from(arrayBuffer)
  };
};

type UpsertProgressPayload = {
  last_page: number;
  total_pages: number;
  bookmarks: number[];
  last_location?: string | null;
  bookmarks_cfi?: string[];
  zoom: number;
  theme: 'paper' | 'sepia' | 'night';
  renderer: 'canvas' | 'native';
};

export const getOwnedBookMeta = async (userId: string, bookId: string) => {
  await assertOwnsBook(userId, bookId);

  const { data, error } = await supabaseAdmin
    .from('books')
    .select('id,title,format')
    .eq('id', bookId)
    .single();

  if (error || !data) {
    throw notFound('Book not found');
  }

  return data;
};

export const getReadingProgress = async (userId: string, bookId: string) => {
  await assertOwnsBook(userId, bookId);

  const { data, error } = await supabaseAdmin
    .from('reading_progress')
    .select('book_id,last_page,total_pages,bookmarks,last_location,bookmarks_cfi,zoom,theme,renderer,updated_at')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  return data;
};

export const upsertReadingProgress = async (userId: string, bookId: string, payload: UpsertProgressPayload) => {
  await assertOwnsBook(userId, bookId);

  const sanitizedBookmarks = [...new Set(payload.bookmarks)]
    .filter((page) => Number.isInteger(page) && page >= 1)
    .sort((a, b) => a - b);

  const { data, error } = await supabaseAdmin
    .from('reading_progress')
    .upsert(
      {
        user_id: userId,
        book_id: bookId,
        last_page: payload.last_page,
        total_pages: payload.total_pages,
        bookmarks: sanitizedBookmarks,
        last_location: payload.last_location ?? null,
        bookmarks_cfi: payload.bookmarks_cfi ?? [],
        zoom: payload.zoom,
        theme: payload.theme,
        renderer: payload.renderer
      },
      { onConflict: 'user_id,book_id' }
    )
    .select('book_id,last_page,total_pages,bookmarks,last_location,bookmarks_cfi,zoom,theme,renderer,updated_at')
    .single();

  if (error || !data) {
    throw badRequest(error?.message ?? 'Failed to save reading progress');
  }

  return data;
};
