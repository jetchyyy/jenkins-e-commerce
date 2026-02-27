import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  return (
    <section className="space-y-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">Superadmin Dashboard</h1>
      <div className="w-20 h-1 bg-[#3b82f6] rounded-full"></div>

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        <Link
          to="/admin/books"
          className="rounded-2xl bg-white p-6 shadow-md border border-[#d1e4ff] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline group"
        >
          <div className="text-[#1e3a8a] mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1e3a8a] mb-1">Manage Books</h2>
          <p className="text-sm text-slate-500 font-body">Add, edit, and organize digital books</p>
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-2xl bg-white p-6 shadow-md border border-[#d1e4ff] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline group"
        >
          <div className="text-[#1e3a8a] mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1e3a8a] mb-1">View Orders</h2>
          <p className="text-sm text-slate-500 font-body">Track customer purchases and statuses</p>
        </Link>
        <Link
          to="/admin/analytics"
          className="rounded-2xl bg-white p-6 shadow-md border border-[#d1e4ff] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline group"
        >
          <div className="text-[#1e3a8a] mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1e3a8a] mb-1">Analytics</h2>
          <p className="text-sm text-slate-500 font-body">Monitor revenue and overall platform performance</p>
        </Link>
        <Link
          to="/admin/users"
          className="rounded-2xl bg-white p-6 shadow-md border border-[#d1e4ff] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline group"
        >
          <div className="text-[#1e3a8a] mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V9H2v11h5m10 0v-2a4 4 0 00-8 0v2m8 0H9m8-10a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1e3a8a] mb-1">User Management</h2>
          <p className="text-sm text-slate-500 font-body">View and monitor registered website users</p>
        </Link>
      </div>
    </section>
  );
};
