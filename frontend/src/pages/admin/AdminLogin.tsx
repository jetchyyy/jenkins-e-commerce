import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

export const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });
    const navigate = useNavigate();
    const { user } = useAuth();

    // Already logged in as superadmin — redirect immediately
    if (user?.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
        return null;
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) {
            return;
        }
        setLoading(true);
        try {
            await authApi.login(email, password);
            setModal({ isOpen: true, type: 'success', title: 'Sign In Successful', message: 'Welcome to the admin dashboard.' });
        } catch (err) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Sign In Failed',
                message: getFriendlyErrorMessage(err, 'Unable to sign in right now.')
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-[#1e3a8a]">
            {/* Background accent */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,_transparent_60%)] pointer-events-none" />

            <div className="relative w-full max-w-md mx-4">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="text-white text-5xl mb-3 select-none">✝</div>
                    <h1 className="font-heading text-3xl font-bold text-white tracking-wide">David Jenkins</h1>
                    <p className="text-[#93c5fd] text-sm mt-1 tracking-widest uppercase font-semibold">Superadmin Portal</p>
                </div>

                {/* Card */}
                <form
                    onSubmit={onSubmit}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 space-y-5 shadow-2xl"
                >
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#bfdbfe] block">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="superadmin@bookstore.local"
                            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa] transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-[#bfdbfe] block">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-white px-6 py-3 font-bold text-[#1e3a8a] hover:bg-[#d1e4ff] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
                    </button>
                </form>

                {/* Back link */}
                <p className="text-center mt-6">
                    <Link to="/" className="text-sm text-[#93c5fd] hover:text-white transition-colors no-underline">
                        ← Back to Public Site
                    </Link>
                </p>
            </div>
            <ActionModal
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmLabel={modal.type === 'success' ? 'Open Dashboard' : 'Close'}
                onConfirm={() => {
                    const wasSuccess = modal.type === 'success';
                    setModal((prev) => ({ ...prev, isOpen: false }));
                    if (wasSuccess) {
                        navigate('/admin/dashboard');
                    }
                }}
            />
        </div>
    );
};
