import { useParams, Link } from 'react-router-dom';
import { useBook } from '../../hooks/useBooks';
import { cartStore } from '../../store/cart.store';
import { formatCurrency } from '../../lib/format';

export const BookDetails = () => {
  const { id = '' } = useParams();
  const { data, isLoading, error } = useBook(id);
  const add = cartStore((state) => state.add);

  // ── Shared full-bleed wrapper ──────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <section
      className="relative min-h-screen flex items-center justify-center py-28 px-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/books.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#050e1f]/82" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {children}
      </div>
    </section>
  );

  if (isLoading) return (
    <Shell>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
        <p className="text-white/40 text-sm font-medium">Loading book…</p>
      </div>
    </Shell>
  );

  if (error) return (
    <Shell>
      <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-300 font-medium">{(error as Error).message}</p>
      </div>
    </Shell>
  );

  if (!data?.book) return (
    <Shell>
      <div className="text-center py-32 space-y-3">
        <p className="text-white/50 text-lg font-medium">Book not found.</p>
        <Link to="/books" className="text-blue-400 text-sm font-semibold no-underline hover:text-blue-300 transition-colors">
          ← Back to Books
        </Link>
      </div>
    </Shell>
  );

  const book = data.book;

  return (
    <Shell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/40 mb-6">
        <Link to="/books" className="no-underline hover:text-blue-400 transition-colors">Books</Link>
        <span className="text-white/20">/</span>
        <span className="text-white/70 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Card */}
      <article className="bg-white/6 backdrop-blur-2xl border border-white/12 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">

          {/* ── Left: Cover ── */}
          <div className="relative flex items-center justify-center p-10 md:p-14 min-h-[380px] bg-gradient-to-br from-[#1e3a8a]/20 to-[#0c1a40]/40">
            {/* Glow behind book */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,_rgba(29,78,216,0.18)_0%,_transparent_70%)] pointer-events-none" />
            <img
              src={book.cover_url}
              alt={book.title}
              className="relative w-full max-w-[260px] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] object-cover hover:scale-[1.03] transition-transform duration-500"
            />
            <span className="absolute top-5 left-5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
              New
            </span>
          </div>

          {/* ── Right: Details ── */}
          <div className="flex flex-col justify-center p-8 md:p-12 space-y-6">

            {/* Meta */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Digital Book</span>
                <div className="flex text-amber-400 text-xs gap-0.5">★★★★★</div>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-black text-white leading-tight">
                {book.title}
              </h1>
              <p className="text-white/40 font-medium">by {book.author}</p>
            </div>

            <div className="h-px bg-white/8" />

            {/* Description */}
            <p className="text-white/65 leading-relaxed text-base">
              {book.description}
            </p>

            <div className="h-px bg-white/8" />

            {/* Price + Actions */}
            <div className="space-y-5">
              <div>
                <p className="text-3xl font-black text-white">
                  {formatCurrency(book.price_cents, book.currency)}
                </p>
                <p className="text-white/35 text-xs mt-1 uppercase tracking-wider">One-time purchase · Instant access</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => add(book.id)}
                  className="flex items-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-3 text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <Link
                  to="/books"
                  className="rounded-xl border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-bold px-7 py-3 text-sm no-underline transition-all duration-200 backdrop-blur-sm"
                >
                  ← Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Shell>
  );
};

