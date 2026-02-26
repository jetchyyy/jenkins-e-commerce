import { Link } from 'react-router-dom';
import { useLibrary } from '../../hooks/useLibrary';

export const Library = () => {
  const { data, isLoading, error } = useLibrary();

  if (isLoading) return <p>Loading library...</p>;
  if (error) return <p>{(error as Error).message}</p>;

  const rows = data?.library ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Library</h1>
      <div className="grid gap-3">
        {rows.map((entry) => {
          const item = entry as {
            id: string;
            book: { id: string; title: string; author: string };
            granted_at: string;
          };

          return (
            <div key={item.id} className="flex items-center justify-between rounded border bg-white p-4">
              <div>
                <p className="font-medium">{item.book.title}</p>
                <p className="text-sm text-slate-600">{item.book.author}</p>
              </div>
              <Link to={`/reader/${item.book.id}`} className="rounded bg-brand-700 px-3 py-1 text-sm text-white">
                Read / Download
              </Link>
            </div>
          );
        })}
        {rows.length === 0 && <p>No purchased books yet.</p>}
      </div>
    </section>
  );
};
