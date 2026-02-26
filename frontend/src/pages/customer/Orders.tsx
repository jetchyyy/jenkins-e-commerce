import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../lib/format';

export const Orders = () => {
  const { data, isLoading, error } = useOrders();

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  const orders = data?.orders ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const row = order as { id: string; status: string; total_cents: number; created_at: string };
          return (
            <article key={row.id} className="rounded border bg-white p-4">
              <p className="font-medium">Order {row.id}</p>
              <p className="text-sm">Status: {row.status}</p>
              <p className="text-sm">Total: {formatCurrency(row.total_cents)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};
