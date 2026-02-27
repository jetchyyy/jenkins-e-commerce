import davidImg from '../../assets/images/davidjenkins.avif';

/* ══════════════════════════════════════════════════════
   PAGE — Author
   Video background + glassmorphism card layout
   ══════════════════════════════════════════════════════ */
export const Author = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050e1f] pt-28 pb-16 px-4">

            {/* ── Background Video (same as Hero) ── */}
            <video
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src="/videos/background.mp4" type="video/mp4" />
            </video>

            {/* Gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050e1f]/70 via-[#0a1628]/50 to-[#050e1f]/80 z-10" />
            {/* Blue atmospheric tint */}
            <div className="absolute inset-0 bg-[#1e3a8a]/30 z-10 mix-blend-multiply" />
            {/* Radial glow from top */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,_rgba(96,165,250,0.15)_0%,_transparent_70%)] z-10" />

            {/* ── Glassmorphism Card ── */}
            <div className="relative z-20 w-full max-w-5xl mx-auto">

                {/* Section label above card */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-px w-10 bg-blue-400/50" />
                    <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.3em]">✝ The Author</span>
                    <div className="h-px w-10 bg-blue-400/50" />
                </div>

                {/* Card */}
                <div className="bg-white/8 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="flex flex-col md:flex-row">

                        {/* ── Left: David Jenkins Image ── */}
                        <div className="md:w-72 lg:w-96 flex-shrink-0 relative min-h-[320px] md:min-h-0 overflow-hidden">
                            <img
                                src={davidImg}
                                alt="David Jenkins"
                                className="absolute inset-0 w-full h-full object-cover object-top"
                            />
                            {/* Soft gradient overlay to blend smoothly into the card border */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a40]/80 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* ── Right: Bio Content ── */}
                        <div className="flex-1 flex flex-col justify-center p-8 md:p-10 lg:p-14 gap-6">

                            {/* Header */}
                            <div className="space-y-1">
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-[0.25em]">About the Author</p>
                                <h1 className="font-heading text-4xl lg:text-5xl font-black text-white leading-tight">
                                    David Jenkins
                                </h1>
                                <div className="h-1 w-12 bg-blue-500 rounded-full mt-2" />
                            </div>

                            {/* Bio */}
                            <p className="text-white/70 leading-relaxed text-base lg:text-lg">
                                David Jenkins is a man that has truly put all of his love, trust, and worthiness into
                                the King James Version of the Bible and our heavenly Father. Since his calling to the
                                Bible in 2011, David fell in love with the scriptures and believes all of the Bible to
                                be relevant to our lives today, and not just about things of the past. In these last
                                12 years he has learned how to listen to the voice of the Father. And through this
                                learning he has learned how and why this all began. This is the fifth book that David
                                has written and each one takes readers to a deeper and more thoughtful understanding
                                of our Father and what He is all about, and why He is doing what He is doing. This is
                                all shown in the King James Version of the Bible and now he is sharing all of this
                                knowledge with the world for those that want to learn what life is all about.
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                {/* YouTube button */}
                                <a
                                    href="https://www.youtube.com/@THEJENKS1000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 no-underline transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5"
                                >
                                    {/* YouTube icon */}
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    YouTube Channel
                                </a>

                                {/* Browse Books */}
                                <a
                                    href="/books"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/50 text-white/75 hover:text-white font-semibold text-sm px-6 py-3 no-underline transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
                                >
                                    Browse Books
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

