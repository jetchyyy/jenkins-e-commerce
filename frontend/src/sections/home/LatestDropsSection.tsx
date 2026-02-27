import { Link } from 'react-router-dom';
import { cartStore } from '../../store/cart.store';
import { formatCurrency } from '../../lib/format';
import { useScrollReveal } from '../../hooks/useScrollReveal';

type Book = {
    id: string;
    title: string;
    author: string;
    description: string;
    cover_url: string;
    price_cents: number;
    currency: string;
};

// ── Static spotlight content (backend team will wire this up later) ──────────
const SPOTLIGHT = {
    label: 'Latest Drop',
    title: 'A Journey Through the Word',
    description:
        'Dive deep into a rich exploration of scripture, faith, and spiritual transformation. This book takes readers on a personal journey through timeless biblical truths, written with clarity, passion, and purpose. Whether you are new to the faith or have walked with God for years, this drop will challenge and inspire you.',
};
// ─────────────────────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════════════
   SECTION 3 — The Latest Drops
   Full-bleed cinematic layout with waterfall video bg.
   ══════════════════════════════════════════════════════ */
export const LatestDropsSection = ({ books }: { books: Book[] }) => {
    const ref = useScrollReveal();
    const add = cartStore((s) => s.add);

    // Featured book — first book from API (or null if none loaded yet)
    const featured = books[0] ?? null;

    if (!featured) return null;

    return (
        <section ref={ref} className="relative overflow-hidden min-h-[85vh] flex items-center">
            {/* ── Waterfall Video Background ──────────────────────────── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src="/videos/waterfall.mp4" type="video/mp4" />
            </video>

            {/* Dark blue overlay for legibility */}
            <div className="absolute inset-0 bg-[#0c1a40]/50 z-10" />

            {/* Subtle top gradient blend from previous section */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent z-10" />

            {/* ── Content ─────────────────────────────────────────────── */}
            <div className="relative z-20 mx-auto max-w-7xl w-full px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center animate-on-scroll">

                {/* ── Left: Book Cover ── */}
                <div className="flex justify-center md:justify-end">
                    <div className="relative group">
                        {/* Glow behind cover */}
                        <div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-2xl group-hover:bg-blue-400/30 transition-all duration-500" />
                        <img
                            src={featured.cover_url}
                            alt={featured.title}
                            className="relative w-56 sm:w-64 md:w-72 lg:w-80 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-[1.03] transition-transform duration-500 object-cover"
                        />
                        {/* "New" badge */}
                        <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            New
                        </span>
                    </div>
                </div>

                {/* ── Right: Spotlight Info ── */}
                <div className="flex flex-col gap-6 md:max-w-lg">
                    {/* Section label */}
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-10 bg-blue-400 rounded-full" />
                        <span className="text-blue-300 text-sm font-bold uppercase tracking-[0.2em]">
                            {SPOTLIGHT.label}
                        </span>
                    </div>

                    {/* Spotlight title (static/mock) */}
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                        {SPOTLIGHT.title}
                    </h2>

                    {/* Book author */}
                    <p className="text-blue-200 text-sm font-semibold tracking-wide">
                        by {featured.author}
                    </p>

                    {/* Spotlight description (static/mock) */}
                    <p className="text-white/70 text-base leading-relaxed">
                        {SPOTLIGHT.description}
                    </p>

                    {/* Price */}
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(featured.price_cents, featured.currency)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 flex-wrap">
                        <Link
                            to={`/books/${featured.id}`}
                            className="rounded-full border-2 border-white/40 px-7 py-3 text-sm font-bold text-white no-underline hover:bg-white hover:text-[#1e3a8a] transition-all duration-300"
                        >
                            View Details
                        </Link>
                        <button
                            onClick={() => add(featured.id)}
                            className="rounded-full bg-blue-500 hover:bg-blue-400 px-7 py-3 text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

