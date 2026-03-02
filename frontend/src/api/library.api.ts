import { apiFetch, apiFetchBlob } from './client';

export type ReadingProgressPayload = {
  last_page: number;
  total_pages: number;
  bookmarks: number[];
  last_location?: string;
  bookmarks_cfi?: string[];
  zoom: number;
  theme: 'paper' | 'sepia' | 'night';
  renderer: 'canvas' | 'native';
};

export const libraryApi = {
  list: () => apiFetch<{ library: Array<Record<string, unknown>> }>('/api/library'),
  meta: (bookId: string) => apiFetch<{ book: { id: string; title: string; format: 'pdf' | 'epub' } }>(`/api/library/${bookId}/meta`),
  download: (bookId: string) => apiFetch<{ signed_url: string }>(`/api/library/${bookId}/download`),
  streamPdf: (bookId: string) => apiFetchBlob(`/api/library/${bookId}/stream`),
  getProgress: (bookId: string) => apiFetch<{ progress: ReadingProgressPayload | null }>(`/api/library/${bookId}/progress`),
  saveProgress: (bookId: string, payload: ReadingProgressPayload) =>
    apiFetch<{ progress: ReadingProgressPayload }>(`/api/library/${bookId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};
