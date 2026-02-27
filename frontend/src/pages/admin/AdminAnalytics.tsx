import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

// Reuse formatCents utility
const formatCents = (cents: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export const AdminAnalytics = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-analytics'], queryFn: adminApi.analytics });

  if (isLoading) return <p className="py-12 text-center text-slate-500 animate-pulse">Loading analytics...</p>;
  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  const totals = (data?.totals as Array<{ total_revenue: number; total_orders: number }>)?.[0];

  return (
    <section className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="border-b border-[#d1e4ff] pb-6">
        <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">Analytics Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor revenue and platform performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#eff6ff] to-white p-8 shadow-md border border-[#d1e4ff] relative">
          <div className="absolute -right-6 -top-6 text-[#93c5fd] opacity-20">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#2563eb] mb-2">Total Revenue</h2>
            <p className="text-4xl font-heading font-black text-[#1e3a8a]">
              {totals?.total_revenue ? formatCents(totals.total_revenue) : '$0.00'}
            </p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#eff6ff] to-white p-8 shadow-md border border-[#d1e4ff] relative">
          <div className="absolute -right-6 -top-6 text-[#93c5fd] opacity-20">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#2563eb] mb-2">Total Orders</h2>
            <p className="text-4xl font-heading font-black text-[#1e3a8a]">
              {totals?.total_orders?.toLocaleString() ?? '0'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-[#1e3a8a] bg-[#1e3a8a] overflow-hidden shadow-lg">
        <div className="border-b border-white/10 bg-white/5 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#93c5fd]">Raw Data Export</h3>
        </div>
        <pre className="overflow-auto p-6 text-xs text-[#d1e4ff]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
};

