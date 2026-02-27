import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api/books.api';
import { adminApi } from '../api/admin.api';

export const useBooks = () => useQuery({ queryKey: ['books'], queryFn: booksApi.list });

export const useBook = (id: string) => useQuery({ queryKey: ['book', id], queryFn: () => booksApi.get(id), enabled: !!id });

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => adminApi.updateBook(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] })
  });
};
