import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth.api';
import { useState, useEffect } from 'react';
import { cartStore } from '../../store/cart.store';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cartStore((state) => state.bookIds.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isPublicUser = user && user.role !== 'superadmin';

  // Transparent only on the home page before scrolling
  const isTransparent = isHome && !scrolled;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `relative no-underline transition-all duration-300 py-1.5 group text-sm font-semibold tracking-wide
    ${isActive(path)
      ? 'text-white'
      : 'text-white/65 hover:text-white'
    }`;

  const mainLinks = [
    { to: '/', label: 'Home' },
    { to: '/author', label: 'Author' },
    { to: '/books', label: 'Books' },
    { to: '/cart', label: `Cart${cartCount > 0 ? ` (${cartCount})` : ''}` },
  ];
  const customerLinks = isPublicUser
    ? [
      { to: '/library', label: 'Library' },
      { to: '/orders', label: 'Orders' },
    ]
    : [];
  const allLinks = [...mainLinks, ...customerLinks];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isTransparent
        ? 'bg-transparent py-5'
        : 'bg-[#0c1d4a]/90 backdrop-blur-2xl border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.4)] py-3.5'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* ── Brand ── */}
        <Link
          to="/"
          className="font-heading text-xl font-black tracking-widest flex items-center gap-2.5 group no-underline text-white transition-all duration-300 hover:opacity-90"
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${scrolled || !isHome
            ? 'bg-blue-500/20 border border-blue-400/30 group-hover:bg-blue-500/30'
            : 'bg-white/10 border border-white/20 group-hover:bg-white/20'
            }`}>
            <span className="text-sm font-bold text-blue-300">✝</span>
          </div>
          <span className="hidden sm:block">David Jenkins</span>
        </Link>

        {/* ── Desktop Nav links ── */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {allLinks.map((link) => (
            <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
              {link.label}
              {isActive(link.to)
                ? <span className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-400 rounded-full" />
                : <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/60 rounded-full transition-all duration-300 group-hover:w-full" />
              }
            </Link>
          ))}

          {/* Auth actions */}
          {!isPublicUser ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className="relative text-sm font-semibold text-white/75 hover:text-white no-underline transition-colors duration-300 px-2 py-1.5 group"
              >
                Sign In
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/60 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                to="/register"
                className="rounded-full px-5 py-2.5 text-sm font-bold no-underline transition-all duration-300 hover:-translate-y-0.5 bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <button
              className="rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 ml-2"
              onClick={() => void authApi.logout()}
            >
              Log Out
            </button>
          )}
        </nav>

        {/* ── Mobile Hamburger Button ── */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {menuOpen && (
        <div className="md:hidden bg-[#0c1d4a]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-4 space-y-1">
          {allLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-all duration-200 ${isActive(link.to)
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:text-white hover:bg-white/10'
                }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10 mt-2 space-y-1">
            {!isPublicUser ? (
              <>
                <Link
                  to="/login"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200 no-underline"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-white bg-blue-500 hover:bg-blue-400 transition-all duration-200 no-underline text-center"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                className="w-full text-left rounded-xl px-4 py-3 text-sm font-bold text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => void authApi.logout()}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
