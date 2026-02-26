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
