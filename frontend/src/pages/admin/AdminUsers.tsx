import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'superadmin' | 'customer';
  created_at: string;
};

export const AdminUsers = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.users });

  if (isLoading) return <p className="py-12 text-center text-slate-500 animate-pulse">Loading users...</p>;
  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  const users = (data?.users ?? []) as UserRow[];

  return (
    <section className="space-y-6 max-w-6xl mx-auto py-8">
      <div className="border-b border-[#d1e4ff] pb-6">
        <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">View all registered users in your e-commerce website</p>
      </div>

      <div className="rounded-2xl border border-[#d1e4ff] bg-white shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-[#eff6ff]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Name</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Email</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Role</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-sm text-slate-800">{user.full_name || 'N/A'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-5 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No users found.</p>}
      </div>
    </section>
  );
};
