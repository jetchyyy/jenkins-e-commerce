import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../lib/format';

export const Orders = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useOrders(page);

  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  // Destructure pagination metadata
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="space-y-6 max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="border-b border-[#d1e4ff] pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Review your past purchases</p>
        </div>
        {isFetching && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading…</span>}
      </div>

      {isLoading && orders.length === 0 ? (
        <p className="py-12 text-center text-slate-500 animate-pulse">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-white rounded-2xl border border-[#d1e4ff] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d1e4ff] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-[#d1e4ff]">
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Order ID</th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Date</th>
                  <th className="hidden sm:table-cell px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Items</th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap text-right">Total</th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1e4ff]/50">
                {orders.map((record: any) => {
                  const date = new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                  const itemsCount = record.order_items?.length || 0;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-[11px] sm:text-sm font-mono text-slate-500">#{record.id.split('-')[0]}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-[11px] sm:text-sm font-medium text-[#1e3a8a] whitespace-nowrap">{date}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-slate-500">{itemsCount} {itemsCount === 1 ? 'book' : 'books'}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-black text-[#1e3a8a] text-right">{formatCurrency(record.total_cents)}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-center">
                        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 sm:px-2.5 text-[8px] sm:text-[10px] font-bold tracking-wider uppercase ${record.status.toLowerCase() === 'completed' || record.status.toLowerCase() === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : record.status.toLowerCase() === 'failed' || record.status.toLowerCase() === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standard Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#d1e4ff] px-6 py-4 bg-slate-50/30">
              <span className="text-sm text-slate-500">
                Page <span className="font-bold text-[#1e3a8a]">{page}</span> of <span className="font-bold text-[#1e3a8a]">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-bold text-[#1e3a8a] hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="rounded-lg border border-[#d1e4ff] bg-white px-4 py-2 text-sm font-bold text-[#1e3a8a] hover:bg-slate-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
