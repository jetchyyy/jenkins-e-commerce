import book1 from '../../assets/images/Book 1 front.jpg';
import book2 from '../../assets/images/BOOK 2 FRONT.jpg';
import book3 from '../../assets/images/BOOK 3 FRONT.jpg';
import book4 from '../../assets/images/BOOK 4 FRONT.jpg';
import book5 from '../../assets/images/BOOK 5 FRONT.jpg';
import book6 from '../../assets/images/BOOK 6 FRONT.jpg';
import book7 from '../../assets/images/BOOK 7 FRONT.jpg';
import book8 from '../../assets/images/BOOK 8 FRONT.jpg';
import davidImg from '../../assets/images/davidjenkins.png';

const heroBooks = {
    left: [book1, book2, book3, book4],
    right: [book5, book6, book7, book8],
};

/* ══════════════════════════════════════════════════════
   SECTION 1 — Welcome Hero
   All content visible within one viewport — no clipping.
   Layout: top (badge+title+subtitle) | middle (books) | bottom (CTAs)
   ══════════════════════════════════════════════════════ */
export const HeroSection = () => (
    <section className="relative h-screen flex flex-col overflow-hidden bg-[#050e1f]">

        {/* ── Background Video ── */}
        <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
        >
            <source src="/videos/background.mp4" type="video/mp4" />
        </video>

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050e1f]/50 via-transparent to-[#050e1f]/50 z-10" />
        {/* Blue tint */}
        <div className="absolute inset-0 bg-[#1e3a8a]/10 z-10 mix-blend-multiply" />
        {/* Radial glow from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,_rgba(96,165,250,0.18)_0%,_transparent_70%)] z-10" />

        {/* ── Content ── justify-between ensures top/mid/bottom never overlap ── */}
        <div className="relative z-20 flex flex-col items-center w-full h-full px-4"
            style={{ paddingTop: '76px', paddingBottom: '40px' }}>

            {/* ── TOP: Badge + Title + Tagline ── */}
            <div className="flex flex-col items-center gap-2 shrink-0 text-center">
                <div className="flex items-center gap-2.5">
                    <div className="h-px w-8 bg-blue-400/60" />
                    <span className="text-blue-300 text-[11px] font-bold uppercase tracking-[0.3em]">✝ David Jenkins</span>
                    <div className="h-px w-8 bg-blue-400/60" />
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-wide leading-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                    Welcome
                </h1>
                <p className="text-white/45 text-xs sm:text-sm tracking-widest uppercase font-medium">
                    Digital Books &amp; Spiritual Teachings
                </p>
            </div>

            {/* ── MIDDLE: Left Books + David + Right Books (all screen sizes) ── */}
            <div className="flex items-center justify-center gap-1 sm:gap-4 md:gap-8 lg:gap-12 w-full max-w-[100rem] flex-1 min-h-0 py-2">

                {/* Left books */}
                <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 items-center h-full justify-center">
                    {heroBooks.left.map((src, i) => (
                        <img
                            key={`l-${i}`}
                            src={src}
                            alt={`Book ${i + 1}`}
                            className="h-[12vh] w-auto sm:h-[15vh] md:h-[21vh] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 border border-white/10 object-cover"
                        />
                    ))}
                </div>

                {/* David Jenkins */}
                <div className="relative flex-1 flex items-center justify-center h-full min-w-0 max-w-[26vw] sm:max-w-none">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-110 pointer-events-none" />
                    <img
                        src={davidImg}
                        alt="David Jenkins"
                        className="relative h-full max-h-[55vh] w-auto max-w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] object-contain hover:scale-[1.02] transition-transform duration-700"
                    />
                </div>

                {/* Right books */}
                <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 items-center h-full justify-center">
                    {heroBooks.right.map((src, i) => (
                        <img
                            key={`r-${i}`}
                            src={src}
                            alt={`Book ${i + 5}`}
                            className="h-[12vh] w-auto sm:h-[15vh] md:h-[21vh] rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 border border-white/10 object-cover"
                        />
                    ))}
                </div>
            </div>

            {/* ── BOTTOM: CTA Buttons + Scroll ── */}
            <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <a
                        href="#books"
                        className="rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-6 py-2.5 no-underline transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
                    >
                        Explore Books
                    </a>
                    <a
                        href="#about"
                        className="rounded-full border border-white/30 hover:border-white/60 text-white/75 hover:text-white font-semibold text-sm px-6 py-2.5 no-underline transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
                    >
                        Learn More
                    </a>
                </div>
                {/* Scroll hint */}
                <div className="flex flex-col items-center gap-1 opacity-40 animate-bounce mt-1">
                    <span className="text-white text-[9px] uppercase tracking-[0.2em] font-medium">Scroll</span>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    </section>
);

