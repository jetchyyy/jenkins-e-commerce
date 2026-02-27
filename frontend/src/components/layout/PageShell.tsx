import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export const PageShell = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Pages that render their own full-bleed layout (no max-w container or pt padding)
  const isFullbleed = isHome || ['/author', '/books', '/cart'].some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  // Only the home page manages its own footer (the sections flow into it naturally)
  const showFooter = !isHome;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {isFullbleed ? (
        <main className="flex-1">{children}</main>
      ) : (
        <main className="flex-1 flex flex-col w-full mx-auto max-w-7xl px-4 py-8 pt-24">{children}</main>
      )}
      {showFooter && <Footer />}
    </div>
  );
};

