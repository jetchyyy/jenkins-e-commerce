import { env } from '../lib/env';
import { authStore } from '../store/auth.store';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authStore.getState().accessToken;
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(payload.error ?? 'Request failed');
  }

  return response.json();
};

export { jsonHeaders };
