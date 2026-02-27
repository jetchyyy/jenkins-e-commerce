/* ══════════════════════════════════════════════════════
   ADMIN — Latest Drops Management
   Static UI only — backend team will wire up API calls.
   ══════════════════════════════════════════════════════ */
export const AdminLatestDrops = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="font-heading text-2xl font-bold text-[#1e3a8a]">Latest Drops</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Configure the featured book and spotlight content shown on the public home page.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">

                {/* ── Left: Form ──────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Featured Book Selector */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e3a8a]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-[#1e3a8a]">Featured Book</h3>
                        </div>
                        <p className="text-xs text-slate-400">Select which book appears on the public Latest Drops section.</p>
                        <select
                            disabled
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed focus:outline-none"
                            defaultValue=""
                        >
                            <option value="" disabled>— Select a book — (connect to API)</option>
                        </select>
                        <p className="text-xs text-blue-400 italic">
                            Backend: fetch all books, set featured book by ID.
                        </p>
                    </div>

                    {/* Spotlight Title */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e3a8a]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-[#1e3a8a]">Spotlight Title</h3>
                        </div>
                        <p className="text-xs text-slate-400">The large heading shown next to the book cover.</p>
                        <input
                            type="text"
                            disabled
                            defaultValue="A Journey Through the Word"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed focus:outline-none"
                            placeholder="e.g. A Journey Through the Word"
                        />
                        <p className="text-xs text-blue-400 italic">
                            Backend: store in config table, read on public page load.
                        </p>
                    </div>

                    {/* Spotlight Description */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e3a8a]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-[#1e3a8a]">Spotlight Description</h3>
                        </div>
                        <p className="text-xs text-slate-400">The paragraph shown below the title on the public page.</p>
                        <textarea
                            disabled
                            rows={5}
                            defaultValue="Dive deep into a rich exploration of scripture, faith, and spiritual transformation. This book takes readers on a personal journey through timeless biblical truths, written with clarity, passion, and purpose."
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 bg-slate-50 cursor-not-allowed focus:outline-none resize-none"
                        />
                        <p className="text-xs text-blue-400 italic">
                            Backend: store in config table, read on public page load.
                        </p>
                    </div>

                    {/* Save Button (disabled) */}
                    <button
                        disabled
                        className="w-full bg-[#1e3a8a] text-white font-bold py-3.5 rounded-xl opacity-50 cursor-not-allowed transition-all"
                    >
                        Save Changes — Connect to API first
                    </button>
                </div>

                {/* ── Right: Preview ──────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 sticky top-8">
                    <h3 className="font-semibold text-[#1e3a8a] text-sm uppercase tracking-wider">Public Preview</h3>

                    <div className="rounded-xl overflow-hidden bg-[#0c1a40] p-6 flex gap-6 items-center min-h-[280px]">
                        {/* Mock book cover placeholder */}
                        <div className="w-24 h-36 rounded-xl bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center text-white/30">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Latest Drop</span>
                            <h4 className="text-white font-bold text-lg leading-tight">A Journey Through the Word</h4>
                            <p className="text-white/50 text-xs leading-relaxed line-clamp-3">
                                Dive deep into a rich exploration of scripture, faith, and spiritual transformation…
                            </p>
                            <div className="flex gap-2 pt-1">
                                <div className="rounded-full border border-white/30 px-4 py-1 text-xs text-white/70">View Details</div>
                                <div className="rounded-full bg-blue-500/60 px-4 py-1 text-xs text-white">Add to Cart</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center">
                        This preview updates once connected to the backend.
                    </p>
                </div>
            </div>
        </div>
    );
};

