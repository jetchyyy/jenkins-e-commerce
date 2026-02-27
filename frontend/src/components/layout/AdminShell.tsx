import { Outlet, Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const navLinks = [
    {
        to: '/admin/dashboard',
        label: 'Dashboard',
        exact: true,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        to: '/admin/books',
        label: 'Books',
        exact: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        to: '/admin/orders',
        label: 'Orders',
        exact: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        to: '/admin/analytics',
        label: 'Analytics',
        exact: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        to: '/admin/latest-drops',
        label: 'Latest Drops',
        exact: false,
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
];

export const AdminShell = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Guard: unauthenticated or non-admin
    if (!user) return <Navigate to="/admin" replace />;
    if (user.role !== 'superadmin') return <Navigate to="/" replace />;

    // Close sidebar on route change (mobile)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const isActive = (link: { to: string; exact: boolean }) =>
        link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to);

    const SidebarContent = () => (
        <>
            {/* Brand */}
            <div className="p-6 border-b border-white/10">
                <div className="text-white text-2xl mb-0.5 select-none">✝</div>
                <h1 className="font-heading text-lg font-bold text-white leading-tight">David Jenkins</h1>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#93c5fd]">Superadmin Panel</span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 no-underline ${isActive(link)
                            ? 'bg-white/15 text-white shadow-sm'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Bottom: user info + logout */}
            <div className="p-4 border-t border-white/10 space-y-3">
                <div className="px-4 py-2">
                    <p className="text-xs text-[#93c5fd] font-semibold uppercase tracking-wider">Logged in as</p>
                    <p className="text-sm text-white font-medium truncate mt-0.5">{user.email}</p>
                </div>
                <button
                    onClick={() => void authApi.logout()}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
                <Link
                    to="/"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 no-underline"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Public Site
                </Link>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex bg-[#f1f5f9]">

            {/* ── Desktop Sidebar (md+) ── */}
            <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#1e3a8a] flex-col min-h-screen shadow-xl">
                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Mobile Sidebar Drawer ── */}
            <aside
                className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#1e3a8a] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* ── Main content area ── */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — mobile only */}
                        <button
                            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                        >
                            <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">Admin</p>
                            <h2 className="text-lg md:text-xl font-heading font-bold text-[#1e3a8a] capitalize">
                                {location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#eff6ff] rounded-full px-4 py-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-[#1e3a8a]">Online</span>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
