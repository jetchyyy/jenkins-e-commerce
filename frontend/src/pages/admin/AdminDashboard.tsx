import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Superadmin</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Link to="/admin/books" className="rounded bg-white p-4 shadow-sm">
          Manage Books
        </Link>
        <Link to="/admin/orders" className="rounded bg-white p-4 shadow-sm">
          View Orders
        </Link>
        <Link to="/admin/analytics" className="rounded bg-white p-4 shadow-sm">
          Analytics
        </Link>
      </div>
    </section>
  );
};
