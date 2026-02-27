import { apiFetch } from './client';

export const adminApi = {
  analytics: () => apiFetch<Record<string, unknown>>('/api/admin/analytics'),
  orders: () => apiFetch<{ orders: Array<Record<string, unknown>> }>('/api/admin/orders'),
  createBook: (payload: Record<string, unknown>) =>
    apiFetch('/api/admin/books', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateBook: (id: string, payload: Record<string, unknown>) =>
    apiFetch(`/api/admin/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};

