import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../api/library.api';

export const useLibrary = () => useQuery({ queryKey: ['library'], queryFn: libraryApi.list });

