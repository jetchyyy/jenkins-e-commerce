import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <section className="rounded-2xl bg-white p-10 shadow-sm">
      <h1 className="text-4xl font-bold text-slate-900">Digital books, secured delivery</h1>
      <p className="mt-4 max-w-2xl text-slate-600">Buy once and access forever from your protected library. Files are private and ownership-verified.</p>
      <div className="mt-6">
        <Link to="/books" className="rounded bg-brand-700 px-4 py-2 text-white">
          Browse Books
        </Link>
      </div>
    </section>
  );
};
