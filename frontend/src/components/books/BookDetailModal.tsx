import { useEffect } from 'react';
import { formatCurrency } from '../../lib/format';
import { useBook } from '../../hooks/useBooks';

interface BookDetailModalProps {
    bookId: string;
    onClose: () => void;
}

/* ══════════════════════════════════════════════════════
   BookDetailModal — Premium redesign
   ══════════════════════════════════════════════════════ */
export const BookDetailModal = ({ bookId, onClose }: BookDetailModalProps) => {
    const { data, isLoading } = useBook(bookId);

    // Close on Escape + lock body scroll
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#020c1f]/90 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-3xl bg-[#07122e] border border-white/10 rounded-[2rem] shadow-[0_60px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row"
                style={{ maxHeight: '88vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Close ── */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-white/8 hover:bg-white/16 border border-white/12 flex items-center justify-center transition-all duration-200 group"
                >
                    <svg className="w-3.5 h-3.5 text-white/60 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ── Loading ── */}
                {isLoading && (
                    <div className="flex-1 flex items-center justify-center py-28">
                        <div className="w-9 h-9 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
                    </div>
                )}

                {/* ── Content ── */}
                {!isLoading && data?.book && (() => {
                    const book = data.book;
                    return (
                        <>
                            {/* Left panel — cover */}
                            <div className="relative md:w-72 flex-shrink-0 flex items-end justify-center overflow-hidden min-h-[260px] md:min-h-0">
                                {/* Full-cover ambient bg */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0d2060] to-[#040b22]" />
                                {/* Glow orb */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_60%,_rgba(59,130,246,0.22)_0%,_transparent_70%)] pointer-events-none" />

                                {/* Cover image */}
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="relative z-10 w-full h-full object-cover object-top"
                                    style={{ maxHeight: '88vh' }}
                                />

                                {/* Bottom gradient fade */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#07122e] to-transparent z-20 md:hidden" />

                                {/* Badge */}
                                <span className="absolute top-4 left-4 z-30 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                                    New
                                </span>
                            </div>

                            {/* Right panel — details */}
                            <div className="flex-1 flex flex-col overflow-y-auto p-7 md:p-9 space-y-6" style={{ maxHeight: '88vh' }}>

                                {/* Meta */}
                                <div>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em]">Digital Book</span>
                                        <span className="text-white/20">·</span>
                                        <span className="text-amber-400 text-xs tracking-wide">★★★★★</span>
                                    </div>
                                    <h2 className="font-heading text-2xl md:text-3xl font-black text-white leading-snug">
                                        {book.title}
                                    </h2>
                                    <p className="text-white/35 text-sm mt-1 font-medium">by {book.author}</p>
                                </div>

                                {/* Thin rule */}
                                <div className="h-px bg-gradient-to-r from-blue-500/20 to-transparent" />

                                {/* Description */}
                                <p className="text-white/60 leading-relaxed text-sm flex-1">
                                    {book.description || 'No description available for this title.'}
                                </p>

                                {/* Price block */}
                                <div className="rounded-2xl bg-white/4 border border-white/8 p-5 space-y-4">
                                    <div className="flex items-end gap-3">
                                        <span className="text-3xl font-black text-white">
                                            {formatCurrency(book.price_cents, book.currency)}
                                        </span>
                                        <span className="text-white/30 text-xs uppercase tracking-wider pb-1">
                                            one-time · instant access
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-1.5">
                                        {['Instant digital download', 'Lifetime access', 'King James Bible focus'].map((f) => (
                                            <li key={f} className="flex items-center gap-2.5 text-white/50 text-xs">
                                                <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-1">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black py-3 text-sm transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
                                        >
                                            Purchase Now
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="rounded-xl border border-white/15 hover:border-white/30 text-white/60 hover:text-white px-5 py-3 text-sm font-bold transition-all duration-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

