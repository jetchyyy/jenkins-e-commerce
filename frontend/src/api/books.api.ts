import { apiFetch } from './client';
import { Book } from '../lib/zodSchemas';

export const booksApi = {
  list: () => apiFetch<{ books: Book[] }>('/api/books'),
  get: (id: string) => apiFetch<{ book: Book }>(`/api/books/${id}`),
  trackView: (bookId: string) => apiFetch('/api/books/' + bookId + '/view', { method: 'POST' })
};
