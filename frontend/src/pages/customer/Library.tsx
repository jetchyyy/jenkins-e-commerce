import { Link } from 'react-router-dom';
import { useLibrary } from '../../hooks/useLibrary';

export const Library = () => {
  const { data, isLoading, error } = useLibrary();

  if (isLoading) return <p className="py-12 text-center text-slate-500 animate-pulse">Loading library...</p>;
  if (error) return <p className="py-12 text-center text-red-500">{(error as Error).message}</p>;

  const rows = data?.library ?? [];

  return (
    <section className="space-y-6 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="border-b border-[#d1e4ff] pb-6">
        <h1 className="text-3xl font-heading font-bold text-[#1e3a8a]">My Library</h1>
        <p className="text-sm text-slate-500 mt-1">Purchased books remain in your library permanently and can be opened in secure reader mode.</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-white rounded-2xl border border-[#d1e4ff] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No purchased books yet.</p>
          <Link
            to="/books"
            className="rounded-xl bg-[#1e3a8a] hover:bg-[#163080] text-white font-bold px-6 py-2.5 text-sm transition-all duration-300 shadow-md shadow-blue-500/20"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((entry) => {
            const item = entry as {
              id: string;
              book: { id: string; title: string; author: string; cover_url?: string | null };
              granted_at: string;
            };

            return (
              <div key={item.id} className="flex flex-col rounded-2xl border border-[#d1e4ff] bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex gap-4">
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg shadow-sm border border-slate-100 bg-slate-50">
                    {item.book.cover_url ? (
                      <img src={item.book.cover_url} alt={item.book.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">No Cover</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-[#1e3a8a] text-base leading-snug line-clamp-2">{item.book.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.book.author}</p>
                    <div className="mt-auto pt-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Purchased</p>
                      <p className="text-xs text-slate-500">{new Date(item.granted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-[#d1e4ff]">
                  <Link
                    to={`/reader/${item.book.id}`}
                    className="w-full flex items-center justify-center rounded-xl bg-[#1e3a8a] hover:bg-[#163080] py-2.5 text-sm font-bold text-white transition-all duration-300 shadow-sm shadow-blue-500/20"
                  >
                    Read Securely
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
