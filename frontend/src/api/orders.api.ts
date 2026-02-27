import { apiFetch } from './client';

export const ordersApi = {
  list: () => apiFetch<{ orders: Array<Record<string, unknown>> }>('/api/orders')
};

