import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

// Reusing a format utility locally for now since we don't have currency in the row type out of the box
const formatCents = (cents: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export const AdminOrders = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-orders'], queryFn: adminApi.orders });

  if (isLoading) return <p className="py-12 text-center text-slate-500 animate-pulse">Loading orders...</p>;
  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  return (
    <section className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="border-b border-[#d1e4ff] pb-6">
        <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">All Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Review all customer transactions</p>
      </div>

      <div className="space-y-4">
        {data?.orders?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#93c5fd] bg-white p-12 text-center text-slate-500">
            No orders found yet.
          </div>
        )}

        {(data?.orders ?? []).map((order) => {
          const row = order as { id: string; user_id: string; status: string; total_cents: number; created_at?: string };

          return (
            <article key={row.id} className="rounded-xl border border-[#d1e4ff] bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-400 block mb-1 uppercase">Order ID</span>
                  <span className="font-mono text-sm text-[#1e3a8a]">{row.id}</span>
                </div>
                <div className="md:text-right">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 block mb-1 uppercase">Date</span>
                  <span className="text-sm text-slate-700">{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-400 block mb-1 uppercase">Customer</span>
                  <p className="text-sm font-medium text-slate-800 break-all">{row.user_id}</p>
                </div>

                <div className="flex items-center gap-8 sm:justify-end mt-2 sm:mt-0">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-slate-400 block mb-1 uppercase">Status</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.status.toLowerCase() === 'completed' || row.status.toLowerCase() === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {row.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-slate-400 block mb-1 uppercase">Total</span>
                    <p className="text-lg font-bold text-[#1e3a8a] mb-0">{formatCents(row.total_cents)}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

