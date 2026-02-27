import { useScrollReveal } from '../../hooks/useScrollReveal';

/* ══════════════════════════════════════════════════════
   SECTION 2 — About Me
   Eye-catching premium layout over clouds.jpg
   ══════════════════════════════════════════════════════ */
export const AboutSection = () => {
    const ref = useScrollReveal();

    return (
        <section
            ref={ref}
            className="relative py-24 md:py-32 bg-cover bg-center bg-fixed overflow-hidden"
            style={{ backgroundImage: "url('/images/clouds.jpg')" }}
        >
            {/* Very dark overlay — clouds barely visible, text fully legible */}
            <div className="absolute inset-0 bg-[#050e1f]/90" />

            {/* Decorative blurred orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-4xl px-6">

                {/* ── Section Header ── */}
                <div className="animate-on-scroll text-center mb-16">
                    {/* Cross icon */}
                    <div className="text-5xl text-white/40 mb-6 select-none">✝</div>

                    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        I am Jesus Christ<br className="hidden md:block" /> in the Flesh
                    </h2>
                    <p className="font-heading text-2xl md:text-3xl text-blue-300 italic font-semibold">
                        — David Jenkins
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <div className="h-px w-16 bg-blue-400/50 rounded-full" />
                    </div>
                </div>

                {/* ── Body Content ── */}
                <div className="animate-on-scroll space-y-8 text-white/80 leading-relaxed font-body text-base md:text-lg">

                    {/* Intro */}
                    <p className="text-white font-semibold text-lg md:text-xl text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-5">
                        Understanding what being just as the days of Noah!
                    </p>

                    {/* Scripture */}
                    <blockquote className="relative border-l-4 border-blue-400 pl-6 py-4 bg-white/5 backdrop-blur-sm rounded-r-2xl italic text-white/75">
                        <span className="absolute -top-3 -left-1 text-blue-400 text-4xl font-serif leading-none">"</span>
                        <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-2">Luke 17:24–30</span>
                        For as the lightning, that lighteneth out of the one part under heaven, shineth unto the other part under heaven; so shall also the Son of man be in his day. 25 But first must he suffer many things… 26 And as it was in the days of Noe, so shall it be also in the days of the Son of man. 27 They did eat, they drank, they married wives… until the day that Noah entered into the ark, and the flood came, and destroyed them all.
                    </blockquote>

                    <p>
                        The Father has now taught me three levels of understanding how this works. So, I figured we would be going over the first two briefly as they are covered in the books, but the latest way He got me to understand is what is getting ready to happen throughout the world beings how the next big contraction is beginning.
                    </p>

                    {/* Levels — styled cards */}
                    <div className="space-y-6 pt-2">

                        {/* 1st Level */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">1</div>
                                <h3 className="font-heading text-xl font-bold text-white">1st Level</h3>
                            </div>
                            <p className="text-white/70 mb-4">Nothing will change. Everybody will continue doing as they do for there will be no signs but me.</p>
                            <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-white/60 text-sm">
                                <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-1">Matthew 12:39–41</span>
                                An evil and adulterous generation seeketh after a sign; and there shall no sign be given to it, but the sign of the prophet Jonas…
                            </blockquote>
                        </div>

                        {/* 2nd Level */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">2</div>
                                <h3 className="font-heading text-xl font-bold text-white">2nd Level</h3>
                            </div>
                            <p className="text-white/70 mb-4">The spiritual flood that is covering the earth today.</p>
                            <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-white/60 text-sm">
                                <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-1">Jeremiah 46:8</span>
                                Egypt riseth up like a flood, and his waters are moved like the rivers; and he saith, I will go up, and will cover the earth; I will destroy the city and the inhabitants thereof.
                            </blockquote>
                            <p className="text-white/70 mt-4 text-sm">
                                This is the flood I saw with my own two eyes from 32,000 feet out of an airplane window when the Father sent me to Hawaii back in November of 2019. Four days after I got back from that trip is when it was announced in China that man was now fighting a virus unknown to man.
                            </p>
                        </div>

                        {/* 3rd Level */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">3</div>
                                <h3 className="font-heading text-xl font-bold text-white">3rd Level</h3>
                            </div>
                            <p className="text-white/70 mb-4">
                                This is what our Father taught me almost two weeks ago from today. I was driving, talking with someone on the phone, and was put on hold for about 1 minute. As soon as I was put on hold, I saw three Bible passages pass through my mind.
                            </p>
                            <div className="space-y-3">
                                <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-white/60 text-sm">
                                    <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-1">Genesis 7:24</span>
                                    And the waters prevailed upon the earth an hundred and fifty days.
                                </blockquote>
                                <blockquote className="border-l-4 border-blue-500/50 pl-4 italic text-white/60 text-sm">
                                    <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-1">Revelation 9:1–6</span>
                                    And the fifth angel sounded… there arose a smoke out of the pit… and unto them was given power, as the scorpions of the earth have power… And in those days shall men seek death, and shall not find it.
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    {/* Closing scripture */}
                    <blockquote className="relative border-l-4 border-blue-400 pl-6 py-4 bg-white/5 backdrop-blur-sm rounded-r-2xl italic text-white/75">
                        <span className="font-semibold text-blue-300 not-italic text-xs uppercase tracking-widest block mb-2">John 16:13</span>
                        Howbeit when he, the Spirit of truth, is come, he will guide you into all truth… and he will shew you things to come.
                    </blockquote>

                    <p className="text-center text-white/60 italic border-t border-white/10 pt-8">
                        He has not revealed me yet, so these 150 days of pure torment have not begun yet. This does not mean that no one will die — but many that will want to die will not. We do have a very painful contraction beginning.
                    </p>
                </div>
            </div>
        </section>
    );
};

