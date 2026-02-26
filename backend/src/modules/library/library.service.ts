import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest, forbidden, notFound } from '../../utils/http.js';

const PRIVATE_BOOKS_BUCKET = 'books-private';

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

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id,status,total_cents,payment_provider,payment_intent_id,created_at,order_items(id,book_id,price_cents)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return data;
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
