import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ══════════════════════════════════════════════════════
   SECTION — YouTube Showcase
   Embedded videos + channel link, matching site aesthetic
   ══════════════════════════════════════════════════════ */

const videos = [
    {
        id: 'Uo0jbjVOi8E',
        start: 580,
        label: 'Featured Teaching',
    },
    {
        id: 'mnznDarTin4',
        start: 0,
        label: 'Latest Video',
    },
];

export const YouTubeShowcaseSection = () => {
    const ref = useScrollReveal();

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 bg-[#050e1f] overflow-hidden"
        >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-blue-600/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-blue-400/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-6">

                {/* ── Section Header ── */}
                <div className="animate-on-scroll text-center mb-14">
                    <div className="text-4xl text-white/30 mb-5 select-none">▶</div>

                    <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                        Watch &amp; Learn
                    </h2>
                    <p className="text-white/50 text-sm md:text-base tracking-widest uppercase font-medium mb-8">
                        Teachings &amp; Revelations on YouTube
                    </p>

                    {/* Divider */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                    </div>
                </div>

                {/* ── Video Grid ── */}
                <div className="animate-on-scroll grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {videos.map((v) => (
                        <div
                            key={v.id}
                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-blue-400/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        >
                            {/* Label */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">
                                    {v.label}
                                </span>
                            </div>

                            {/* Iframe */}
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${v.id}${v.start ? `?start=${v.start}` : ''}`}
                                    title={v.label}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Channel CTA ── */}
                <div className="animate-on-scroll text-center">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-6 hover:bg-white/8 hover:border-blue-400/30 transition-all duration-300">
                        <div className="flex flex-col items-center sm:items-start gap-1">
                            <span className="text-white font-semibold text-base">
                                @THEJENKS1000
                            </span>
                            <span className="text-white/45 text-xs uppercase tracking-widest">
                                YouTube Channel
                            </span>
                        </div>

                        <a
                            href="https://www.youtube.com/@THEJENKS1000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-2.5 no-underline transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            {/* YouTube icon */}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            Subscribe
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
