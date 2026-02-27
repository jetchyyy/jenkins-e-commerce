import { Link } from 'react-router-dom';

export const Footer = () => {
  const phones = ['+1(239)516-5873', '+1(239)516-5877', '+1(239)516-7152'];

  return (
    <footer className="relative bg-[#0c1d4a]/90 backdrop-blur-2xl text-white overflow-hidden border-t border-white/8 shadow-[0_-4px_32px_rgba(0,0,0,0.4)]">
      {/* Decorative orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-3 items-start">

          {/* ── Brand ── */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 no-underline group">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <span className="text-blue-300 text-base font-bold">✝</span>
              </div>
              <span className="font-heading text-lg font-black text-white tracking-wider">David Jenkins</span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Sharing biblical truth and spiritual insight with the world through books and teachings.
            </p>
            {/* Social */}
            <a
              href="https://www.youtube.com/@THEJENKS1000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/50 hover:text-red-400 no-underline transition-colors duration-300 text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube Channel
            </a>
          </div>

          {/* ── Quick Links ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/author', label: 'Author' },
                { to: '/books', label: 'Browse Books' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-white/50 hover:text-white no-underline transition-colors duration-200 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-400/50 group-hover:bg-blue-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Contact Support</h3>

            {/* Phone numbers */}
            <div className="space-y-2.5">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-2.5 text-white/50 hover:text-white no-underline transition-colors duration-200 text-sm group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-400/30 transition-all duration-200">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  {phone}
                </a>
              ))}
            </div>

            {/* Email */}
            <a
              href="mailto:vagraceteam@gmail.com"
              className="flex items-center gap-2.5 text-white/50 hover:text-white no-underline transition-colors duration-200 text-sm group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-400/30 transition-all duration-200">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              vagraceteam@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 py-5">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {new Date().getFullYear()} David Jenkins. All rights reserved.</p>
          <a
            href="https://www.facebook.com/profile.php?id=61587269647950"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 no-underline transition-colors"
          >
            Created by ODC
          </a>
        </div>
      </div>
    </footer>
  );
};
