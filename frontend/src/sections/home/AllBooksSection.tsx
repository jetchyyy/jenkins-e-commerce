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
                ref={ref}
                className="relative py-24 md:py-32 bg-cover bg-center bg-fixed overflow-hidden"
                style={{ backgroundImage: "url('/images/books.jpg')" }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#050e1f]/80" />

                {/* Decorative orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-7xl px-6">

                    {/* ── Section Header ── */}
                    <div className="animate-on-scroll text-center mb-16">
                        <span className="inline-block text-blue-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Our Collection</span>
                        <h2 className="font-heading text-4xl md:text-5xl font-bold text-white">
                            All Books
                        </h2>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                        </div>
                        <p className="text-white/50 mt-4 text-sm">
                            {books.length} {books.length === 1 ? 'title' : 'titles'} available
                        </p>
                    </div>

                    {/* ── Product Grid ── */}
                    <div className="animate-on-scroll grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {books.map((book, index) => (
                            <article
                                key={book.id}
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.25)] hover:-translate-y-2 transition-all duration-400 border border-white/5"
                            >
                                {/* ── Cover Image with badges ── */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-600"
                                    />
                                    {/* "New" badge on first 2 books */}
                                    {index < 2 && (
                                        <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                                            New
                                        </span>
                                    )}
                                    {/* Quick view overlay */}
                                    <div className="absolute inset-0 bg-[#0c1a40]/0 group-hover:bg-[#0c1a40]/60 transition-all duration-400 flex items-center justify-center">
                                        <button
                                            onClick={() => setSelectedId(book.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white text-[#1e3a8a] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-blue-50 shadow-lg"
                                        >
                                            Quick View
                                        </button>
                                    </div>
                                </div>

                                {/* ── Card Body ── */}
                                <div className="flex flex-col flex-1 p-5 space-y-3">
                                    {/* Title & Author */}
                                    <div className="flex-1">
                                        <h3 className="font-heading text-base font-bold text-[#1e3a8a] line-clamp-2 leading-snug">
                                            {book.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-slate-100" />

                                    {/* Price row */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xl font-bold text-[#1e3a8a]">
                                                {formatCurrency(book.price_cents, book.currency)}
                                            </p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Digital Edition</p>
                                        </div>
                                        <div className="flex text-amber-400 text-xs gap-0.5">
                                            {'★★★★★'.split('').map((_, i) => (
                                                <span key={i}>★</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => add(book.id)}
                                            className="flex-1 rounded-xl bg-[#1e3a8a] hover:bg-[#163080] px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-blue-600/30 flex items-center justify-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => setSelectedId(book.id)}
                                            className="rounded-xl border-2 border-slate-200 hover:border-[#1e3a8a] px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-[#1e3a8a] transition-all duration-200"
                                        >
                                            Details
                                        </button>
                                    </div>
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

