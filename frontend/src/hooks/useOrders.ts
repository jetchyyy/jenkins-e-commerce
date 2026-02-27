import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';

export const useOrders = () => useQuery({ queryKey: ['orders'], queryFn: ordersApi.list });

