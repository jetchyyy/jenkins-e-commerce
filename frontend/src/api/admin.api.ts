import { apiFetch } from './client';

export const adminApi = {
  analytics: () => apiFetch<Record<string, unknown>>('/api/admin/analytics'),
  orders: (page: number = 1, limit: number = 20, search?: string) => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return apiFetch<{ orders: Array<Record<string, unknown>>; total: number }>(`/api/admin/orders?page=${page}&limit=${limit}${searchParam}`);
  },
  users: () => apiFetch<{ users: Array<Record<string, unknown>> }>('/api/admin/users'),
  createBook: (payload: Record<string, unknown>) =>
    apiFetch('/api/admin/books', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateBook: (id: string, payload: Record<string, unknown>) =>
    apiFetch(`/api/admin/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteBook: (id: string) =>
    apiFetch(`/api/admin/books/${id}`, {
      method: 'DELETE'
    }),
  uploadBookFile: (
    id: string,
    payload: { file_base64: string; file_name: string; format: 'pdf' | 'epub' } | { file_path: string; format: 'pdf' | 'epub' }
  ) =>
    apiFetch(`/api/admin/books/${id}/upload`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  uploadBookCover: (
    id: string,
    payload: { file_base64: string; file_name: string; content_type: 'image/webp' | 'image/jpeg' | 'image/png' }
  ) =>
    apiFetch(`/api/admin/books/${id}/cover`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
