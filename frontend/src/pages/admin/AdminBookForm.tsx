import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBook } from '../../hooks/useBooks';

export const AdminBookForm = () => {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    price_cents: 0,
    currency: 'PHP',
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
    <form onSubmit={submit} className="space-y-3 rounded bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Add Book</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className="w-full rounded border px-3 py-2" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      <textarea
        className="w-full rounded border px-3 py-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        className="w-full rounded border px-3 py-2"
        type="number"
        placeholder="Price in cents"
        value={form.price_cents}
        onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
      />
      <input className="w-full rounded border px-3 py-2" placeholder="Cover URL" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
      <select className="w-full rounded border px-3 py-2" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
        <option value="pdf">PDF</option>
        <option value="epub">EPUB</option>
      </select>
      <button className="rounded bg-brand-700 px-4 py-2 text-white" type="submit" disabled={createBook.isPending}>
        {createBook.isPending ? 'Saving...' : 'Save'}
      </button>
      {createBook.error && <p className="text-sm text-red-600">{(createBook.error as Error).message}</p>}
    </form>
  );
};
