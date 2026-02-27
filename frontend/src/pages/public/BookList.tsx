import { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { BookDetailModal } from '../../components/books/BookDetailModal';
import { BookCardModal } from '../../components/books/BookCard';
import { Book } from '../../lib/zodSchemas';

export const BookList = () => {
  const { data, isLoading, error } = useBooks();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allBooks = data?.books ?? [];
  const books = search.trim()
    ? allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    )
    : allBooks;

  return (
    <>
      <section
        className="relative min-h-screen py-28 md:py-32 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/books.jpg')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#050e1f]/80" />

        {/* Decorative orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 space-y-12">

          {/* ── Hero Header ── */}
          <div className="text-center space-y-5 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-blue-400/50" />
              <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.35em]">Our Collection</span>
              <div className="h-px w-10 bg-blue-400/50" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              Book Catalog
            </h1>
            <p className="text-white/45 text-base leading-relaxed">
              Explore David Jenkins' complete library of biblical teachings and spiritual insight.
            </p>

            {/* Search bar */}
            <div className="relative max-w-md mx-auto mt-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author…"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/8 backdrop-blur-md border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400/50 focus:bg-white/12 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Gradient divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          {/* Result count */}
          {!isLoading && !error && (
            <p className="text-white/40 text-sm">
              {search ? (
                <>{books.length} result{books.length !== 1 ? 's' : ''} for <span className="text-white/70 font-medium">"{search}"</span></>
              ) : (
                <>{allBooks.length} title{allBooks.length !== 1 ? 's' : ''} available</>
              )}
            </p>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
              <p className="text-white/40 text-sm font-medium">Loading books…</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6 text-center">
              <p className="text-red-300 font-medium">{(error as Error).message}</p>
            </div>
          )}

          {/* ── Empty search ── */}
          {!isLoading && !error && books.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <p className="text-white/40 text-lg font-medium">No books found for "{search}"</p>
              <button
                onClick={() => setSearch('')}
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* ── Grid ── */}
          {!isLoading && !error && books.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book: Book, i: number) => (
                <BookCardModal key={book.id} book={book} index={i} onViewDetails={setSelectedId} />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedId && (
        <BookDetailModal bookId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
};

