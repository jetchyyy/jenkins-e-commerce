import { useState } from 'react';
import { cartStore } from '../../store/cart.store';
import { formatCurrency } from '../../lib/format';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { BookDetailModal } from '../../components/books/BookDetailModal';

type Book = {
    id: string;
    title: string;
    author: string;
    cover_url: string;
    price_cents: number;
    currency: string;
};

/* ══════════════════════════════════════════════════════
   SECTION 4 — All Books
   Professional e-commerce product grid over books.jpg
   ══════════════════════════════════════════════════════ */
export const AllBooksSection = ({ books }: { books: Book[] }) => {
    const ref = useScrollReveal();
    const add = cartStore((s) => s.add);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <>
            <section
                id="books"
                ref={ref}
                className="relative py-24 md:py-32 bg-cover bg-center bg-fixed overflow-hidden"
                style={{ backgroundImage: "url('/images/books.jpg')" }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#050e1f]/80" />

                {/* Decorative orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

                    {/* ── Section Header ── */}
                    <div className="animate-on-scroll text-center mb-10 sm:mb-16">
                        <span className="inline-block text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-2 sm:mb-4">Our Collection</span>
                        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white">
                            All Books
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                        </div>
                        <p className="text-white/50 mt-4 text-xs sm:text-sm">
                            {books.length} {books.length === 1 ? 'title' : 'titles'} available
                        </p>
                    </div>

                    {/* ── Product Grid ── */}
                    <div className="animate-on-scroll grid gap-2 grid-cols-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {books.slice(0, 15).map((book, index) => (
                            <article
                                key={book.id}
                                className="group flex flex-col bg-white rounded-lg sm:rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] hover:-translate-y-2 transition-all duration-400 border border-white/5 relative h-full"
                            >
                                {/* ── Cover Image with badges ── */}
                                <div className="relative overflow-hidden shrink-0 bg-slate-50 aspect-[2/3] sm:aspect-auto sm:h-64 cursor-pointer" onClick={() => setSelectedId(book.id)}>
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                                    />
                                    {/* "New" badge on first 2 books */}
                                    {index < 2 && (
                                        <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-blue-500 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-md z-10">
                                            New
                                        </span>
                                    )}
                                    {/* Quick view overlay */}
                                    <div className="hidden sm:flex absolute inset-0 bg-[#0c1a40]/0 group-hover:bg-[#0c1a40]/60 transition-all duration-400 items-center justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedId(book.id); }}
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-[#1e3a8a] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-blue-50 shadow-lg"
                                        >
                                            Quick View
                                        </button>
                                    </div>
                                </div>

                                {/* ── Card Body ── */}
                                <div className="flex flex-col flex-1 p-2 sm:p-5 relative pb-8 sm:pb-5">
                                    {/* Title & Author */}
                                    <div className="flex-1 min-h-0">
                                        <h3 className="font-heading text-[10px] sm:text-base font-bold text-[#1e3a8a] line-clamp-2 leading-[1.2] cursor-pointer" title={book.title} onClick={() => setSelectedId(book.id)}>
                                            {book.title}
                                        </h3>
                                        <p className="text-[8px] sm:text-xs text-slate-400 mt-0.5 truncate">by {book.author}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden sm:block h-px bg-slate-100 my-3" />

                                    {/* Price row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 sm:mt-0 gap-1 sm:gap-0">
                                        <div className="text-[11px] sm:text-base font-bold text-[#1e3a8a]">
                                            {formatCurrency(book.price_cents, book.currency)}
                                        </div>
                                        <div className="hidden sm:flex text-amber-400 text-[10px] sm:text-xs gap-0.5">
                                            {'★★★★★'.split('').map((_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons (Desktop) */}
                                    <div className="hidden sm:flex gap-1.5 sm:gap-2 mt-3">
                                        <button
                                            onClick={() => add(book.id)}
                                            className="flex-1 rounded-xl bg-[#1e3a8a] hover:bg-[#163080] px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => setSelectedId(book.id)}
                                            className="flex-1 rounded-xl border border-slate-200 hover:border-[#1e3a8a] px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-[#1e3a8a] transition-all duration-200"
                                        >
                                            Details
                                        </button>
                                    </div>

                                    {/* Mobile floating 'Add' button */}
                                    <button
                                        onClick={() => add(book.id)}
                                        className="sm:hidden absolute bottom-2 right-2 w-6 h-6 bg-[#1e3a8a] hover:bg-[#163080] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
                                        aria-label="Add to cart"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {
                selectedId && (
                    <BookDetailModal bookId={selectedId} onClose={() => setSelectedId(null)} />
                )
            }
        </>
    );
};

