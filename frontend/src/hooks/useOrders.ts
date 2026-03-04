import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';

export const useOrders = (page: number = 1) => useQuery({
    queryKey: ['orders', { page }],
    queryFn: () => ordersApi.list({ page, limit: 10 }),
    placeholderData: keepPreviousData
});
