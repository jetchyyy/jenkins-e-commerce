import { useBooks } from '../../hooks/useBooks';
import { Footer } from '../../components/layout/Footer';

// ─── Home Page Sections ────────────────────────────────────────────────────
// Each section lives in its own file under src/sections/home/ for easy editing.
import { HeroSection } from '../../sections/home/HeroSection';
import { AboutSection } from '../../sections/home/AboutSection';
import { LatestDropsSection } from '../../sections/home/LatestDropsSection';
import { AllBooksSection } from '../../sections/home/AllBooksSection';
import { YouTubeShowcaseSection } from '../../sections/home/YouTubeShowcaseSection';

/* ══════════════════════════════════════════════════════
   HOME PAGE — assembles all sections
   ══════════════════════════════════════════════════════ */
export const Home = () => {
  const { data, isLoading } = useBooks();
  const books = data?.books ?? [];

  return (
    <div className="min-h-screen">
      {/* Section 1 — Hero (src/sections/home/HeroSection.tsx) */}
      <HeroSection />

      {/* Section 2 — About Me (src/sections/home/AboutSection.tsx) */}
      <AboutSection />

      {/* Section 3 — YouTube Showcase (src/sections/home/YouTubeShowcaseSection.tsx) */}
      <YouTubeShowcaseSection />

      {/* Section 4 — Latest Drops (src/sections/home/LatestDropsSection.tsx) */}
      {isLoading ? (
        <section className="py-20 text-center text-slate-500">Loading latest drops...</section>
      ) : (
        <LatestDropsSection books={books} />
      )}

      {/* Section 4 — All Books (src/sections/home/AllBooksSection.tsx) */}
      {isLoading ? (
        <section className="py-20 text-center text-slate-500">Loading books...</section>
      ) : (
        <AllBooksSection books={books} />
      )}

      {/* Section 5 — Footer */}
      <Footer />
    </div>
  );
};

