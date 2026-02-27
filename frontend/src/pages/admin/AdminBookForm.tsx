import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateBook } from '../../hooks/useBooks';

export const AdminBookForm = () => {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    price_cents: 0,
    currency: 'USD',
    cover_url: '',
    format: 'pdf',
    is_active: true
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await createBook.mutateAsync(form);
    navigate('/admin/books');
  };

  return (
    <section className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">Add New Book</h1>
          <p className="text-sm text-slate-500 mt-1">Enter complete details for your digital product</p>
        </div>
        <Link to="/admin/books" className="text-sm font-semibold text-[#1e3a8a] hover:text-[#2563eb] transition-colors">
          &larr; Back to Inventory
        </Link>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[#d1e4ff] bg-white p-8 shadow-lg">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Book Title</label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            placeholder="e.g. For The Powers of Heaven Shall Be Shaken"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Author */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Author Name</label>
          <input
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            placeholder="e.g. David Jenkins"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Description</label>
          <textarea
            required
            rows={5}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all resize-y"
            placeholder="A detailed summary of the book..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Price & Format */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1e3a8a] block">Price (in cents)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                required
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                type="number"
                min="0"
                placeholder="0"
                value={form.price_cents}
                onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Example: For $19.99, enter 1999.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1e3a8a] block">File Format</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all appearance-none"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            >
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="epub">EPUB File (.epub)</option>
            </select>
          </div>
        </div>

        {/* Cover URL */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#1e3a8a] block">Cover Image URL</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
            placeholder="https://example.com/cover.jpg"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
          />
        </div>

        {/* Submit */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
          <Link to="/admin/books" className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            Cancel
          </Link>
          <button
            className="w-full sm:w-auto rounded-full bg-[#1e3a8a] px-8 py-3 text-sm font-bold tracking-wide text-white hover:bg-[#2563eb] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={createBook.isPending}
          >
            {createBook.isPending ? 'Saving...' : 'Save Book'}
          </button>
        </div>

        {createBook.error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-600">{(createBook.error as Error).message}</p>
          </div>
        )}
      </form>
    </section>
  );
};

