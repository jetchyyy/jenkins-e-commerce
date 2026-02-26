import { Link } from 'react-router-dom';
import { useBooks } from '../../hooks/useBooks';

export const AdminBooks = () => {
  const { data, isLoading } = useBooks();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link to="/admin/books/new" className="rounded bg-brand-700 px-3 py-2 text-white">
          Add Book
        </Link>
      </div>
      {isLoading && <p>Loading...</p>}
      <div className="space-y-2">
        {(data?.books ?? []).map((book) => (
          <article key={book.id} className="rounded border bg-white p-3">
            {book.title} - {book.author}
          </article>
        ))}
      </div>
    </section>
  );
};
