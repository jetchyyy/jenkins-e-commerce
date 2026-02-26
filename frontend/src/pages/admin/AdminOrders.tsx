import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

export const AdminOrders = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-orders'], queryFn: adminApi.orders });

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">All Orders</h1>
      {(data?.orders ?? []).map((order) => {
        const row = order as { id: string; user_id: string; status: string; total_cents: number };
        return (
          <article key={row.id} className="rounded border bg-white p-4 text-sm">
            <p>{row.id}</p>
            <p>User: {row.user_id}</p>
            <p>Status: {row.status}</p>
            <p>Total cents: {row.total_cents}</p>
          </article>
        );
      })}
    </section>
  );
};
