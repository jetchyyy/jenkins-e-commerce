import { stripe } from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest } from '../../utils/http.js';

type LineBook = {
  id: string;
  price_cents: number;
  is_active: boolean;
};

const fetchBooks = async (bookIds: string[]): Promise<LineBook[]> => {
  const { data, error } = await supabaseAdmin
    .from('books')
    .select('id,price_cents,is_active')
    .in('id', bookIds);

  if (error || !data) {
    throw badRequest(error?.message ?? 'Unable to fetch books');
  }

  if (data.length !== bookIds.length) {
    throw badRequest('Some selected books do not exist');
  }

  if (data.some((book) => !book.is_active)) {
    throw badRequest('One or more books are not available');
  }

  return data;
};

export const createCheckoutIntent = async (userId: string, email: string, bookIds: string[]) => {
  if (bookIds.length === 0) {
    throw badRequest('book_ids is required');
  }

  const books = await fetchBooks(bookIds);
  const amount = books.reduce((sum, book) => sum + book.price_cents, 0);

  if (env.PAYMENT_MODE === 'mock' || !stripe) {
    return {
      provider: 'mock',
      client_secret: `mock_pi_${Date.now()}`,
      amount,
      currency: 'php'
    };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'php',
    metadata: {
      user_id: userId,
      user_email: email,
      book_ids: JSON.stringify(bookIds)
    }
  });

  return {
    provider: 'stripe',
    client_secret: paymentIntent.client_secret,
    payment_intent_id: paymentIntent.id,
    amount,
    currency: 'php'
  };
};

export const completeMockCheckout = async (userId: string, bookIds: string[]) => {
  const books = await fetchBooks(bookIds);
  const total = books.reduce((sum, book) => sum + book.price_cents, 0);

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid',
      total_cents: total,
      payment_provider: 'mock',
      payment_intent_id: `mock_${Date.now()}`
    })
    .select('*')
    .single();

  if (orderError || !order) {
    throw badRequest(orderError?.message ?? 'Failed to create order');
  }

  const orderItems = books.map((book) => ({
    order_id: order.id,
    book_id: book.id,
    price_cents: book.price_cents
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
  if (itemsError) {
    throw badRequest(itemsError.message);
  }

  const libraryRows = books.map((book) => ({
    user_id: userId,
    book_id: book.id,
    order_id: order.id
  }));

  const { error: libraryError } = await supabaseAdmin.from('library').upsert(libraryRows, {
    onConflict: 'user_id,book_id',
    ignoreDuplicates: true
  });

  if (libraryError) {
    throw badRequest(libraryError.message);
  }

  return order;
};

export const processSuccessfulPayment = async (paymentIntentId: string, userId: string, bookIds: string[]) => {
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('payment_intent_id', paymentIntentId)
    .eq('status', 'paid')
    .maybeSingle();

  if (existingOrder) {
    return existingOrder;
  }

  const books = await fetchBooks(bookIds);
  const total = books.reduce((sum, book) => sum + book.price_cents, 0);

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      status: 'paid',
      total_cents: total,
      payment_provider: 'stripe',
      payment_intent_id: paymentIntentId
    })
    .select('*')
    .single();

  if (orderError || !order) {
    throw badRequest(orderError?.message ?? 'Failed creating paid order');
  }

  const orderItems = books.map((book) => ({
    order_id: order.id,
    book_id: book.id,
    price_cents: book.price_cents
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
  if (itemsError) {
    throw badRequest(itemsError.message);
  }

  const libraryRows = books.map((book) => ({
    user_id: userId,
    book_id: book.id,
    order_id: order.id
  }));

  const { error: libraryError } = await supabaseAdmin.from('library').upsert(libraryRows, {
    onConflict: 'user_id,book_id',
    ignoreDuplicates: true
  });

  if (libraryError) {
    throw badRequest(libraryError.message);
  }

  return order;
};
