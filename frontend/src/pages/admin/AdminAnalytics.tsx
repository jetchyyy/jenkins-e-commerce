import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

export const AdminAnalytics = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-analytics'], queryFn: adminApi.analytics });

  if (isLoading) return <p>Loading analytics...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  const totals = (data?.totals as Array<{ total_revenue: number; total_orders: number }>)?.[0];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue (cents)</p>
          <p className="text-2xl font-semibold">{totals?.total_revenue ?? 0}</p>
        </div>
        <div className="rounded bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="text-2xl font-semibold">{totals?.total_orders ?? 0}</p>
        </div>
      </div>
      <pre className="overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
};
