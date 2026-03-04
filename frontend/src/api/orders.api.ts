import { apiFetch } from './client';

interface PaginationParams { page?: number; limit?: number; }

export const ordersApi = {
  list: (params?: PaginationParams) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', params.page.toString());
    if (params?.limit) q.set('limit', params.limit.toString());
    return apiFetch<{ orders: Array<Record<string, unknown>>, total: number, page: number, limit: number }>(`/api/orders?${q.toString()}`);
  }
};
