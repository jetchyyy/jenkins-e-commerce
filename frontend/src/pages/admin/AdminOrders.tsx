import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

// Reusing a format utility locally for now since we don't have currency in the row type out of the box
const formatCents = (cents: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export const AdminOrders = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input to avoid hitting the API too often while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', page, debouncedSearch],
    queryFn: () => adminApi.orders(page, 20, debouncedSearch),
  });

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  return (
    <section className="space-y-6 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="border-b border-[#d1e4ff] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">All Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Review all customer transactions</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Order ID or Email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#d1e4ff] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#d1e4ff] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-[#d1e4ff] text-[#1e3a8a] text-xs tracking-wider uppercase">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Order ID</th>
                <th scope="col" className="px-6 py-4 font-bold">Date</th>
                <th scope="col" className="px-6 py-4 font-bold">Customer</th>
                <th scope="col" className="px-6 py-4 font-bold">Items</th>
                <th scope="col" className="px-6 py-4 font-bold">Provider</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Total</th>
                <th scope="col" className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1e4ff] relative">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="inline-block w-8 h-8 rounded-full border-4 border-[#1e3a8a]/20 border-t-[#1e3a8a] animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading orders...</p>
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500">
                    {debouncedSearch ? `No orders found for "${debouncedSearch}"` : "No orders found yet."}
                  </td>
                </tr>
              )}
              {!isLoading && orders.map((orderData) => {
                const row = orderData as {
                  id: string;
                  user_id: string;
                  status: string;
                  total_cents: number;
                  created_at?: string;
                  payment_provider?: string;
                  order_items: any[];
                };
                return (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <td className="px-6 py-4 font-mono text-xs text-[#1e3a8a] truncate max-w-[120px]" title={row.id}>{row.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 truncate max-w-[160px] text-slate-500" title={row.user_id}>{row.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{row.order_items?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 capitalize">{row.payment_provider || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#1e3a8a] text-right">
                      {formatCents(row.total_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${row.status.toLowerCase() === 'completed' || row.status.toLowerCase() === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : row.status.toLowerCase() === 'failed' || row.status.toLowerCase() === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="bg-slate-50 border-t border-[#d1e4ff] px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{((page - 1) * 20) + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(page * 20, total)}</span> of <span className="font-semibold text-slate-700">{total}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 rounded-lg border border-[#d1e4ff] bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="px-4 py-1.5 rounded-lg border border-[#d1e4ff] bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

