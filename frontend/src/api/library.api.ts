import { apiFetch, apiFetchBlob } from './client';

export const libraryApi = {
  list: () => apiFetch<{ library: Array<Record<string, unknown>> }>('/api/library'),
  download: (bookId: string) => apiFetch<{ signed_url: string }>(`/api/library/${bookId}/download`),
  streamPdf: (bookId: string) => apiFetchBlob(`/api/library/${bookId}/stream`)
};
