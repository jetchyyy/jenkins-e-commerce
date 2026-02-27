import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useBooks, useDeleteBook } from '../../hooks/useBooks';
import { formatCurrency } from '../../lib/format';
import { ActionModal } from '../../components/feedback/ActionModal';
import { ConfirmModal } from '../../components/feedback/ConfirmModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

export const AdminBooks = () => {
  const { data, isLoading } = useBooks();
  const deleteBook = useDeleteBook();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const onDelete = async () => {
    if (!bookToDelete || deleteBook.isPending) return;
    try {
      await deleteBook.mutateAsync(bookToDelete);
      setBookToDelete(null);
      setModal({ isOpen: true, type: 'success', title: 'Book Deleted', message: 'The book has been removed from the catalog.' });
    } catch (error) {
      setBookToDelete(null);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Delete Failed',
        message: getFriendlyErrorMessage(error, 'Unable to delete this book right now.')
      });
    }
  };

  const openDeleteConfirm = (id: string) => {
    if (deleteBook.isPending) return;
    setBookToDelete(id);
  };

  return (
    <section className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d1e4ff] pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">Books Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your digital catalog</p>
        </div>
        <Link
          to="/admin/books/new"
          className="rounded-full bg-[#1e3a8a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb] hover:shadow-lg transition-all duration-200 no-underline shadow-md"
        >
          + Add New Book
        </Link>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-slate-500 animate-pulse">Loading catalog...</div>
      )}

      <div className="grid gap-4 mt-6">
        {data?.books?.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-[#93c5fd] bg-white p-12 text-center text-slate-500">
            No books found. Add your first digital book to get started!
          </div>
        )}
        {(data?.books ?? []).map((book) => (
          <article
            key={book.id}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-xl border border-[#d1e4ff] bg-white p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex gap-5 items-center">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-16 h-20 object-cover rounded shadow-sm border border-slate-100" />
              ) : (
                <div className="w-16 h-20 bg-slate-100 rounded flex items-center justify-center text-slate-300 shadow-inner">No Image</div>
              )}
              <div>
                <h3 className="text-lg font-bold font-heading text-[#1e3a8a] mb-1">{book.title}</h3>
                <p className="text-sm text-[#2563eb] font-medium">by {book.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 self-end sm:self-auto mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/books/${book.id}/edit`}
                  className="rounded-lg border border-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-[#1e3a8a] no-underline hover:bg-[#eff6ff]"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(book.id)}
                  disabled={deleteBook.isPending}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
              <div className="text-right">
                <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Price</span>
                <span className="font-bold text-[#1e3a8a]">{formatCurrency(book.price_cents, book.currency)}</span>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${book.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {book.is_active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </article>
        ))}
      </div>
      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
      <ConfirmModal
        isOpen={!!bookToDelete}
        title="Delete Book"
        message="Are you sure you want to delete this book from the catalog?"
        confirmLabel="Delete"
        isBusy={deleteBook.isPending}
        onCancel={() => setBookToDelete(null)}
        onConfirm={onDelete}
      />
    </section>
  );
};
