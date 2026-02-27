import { FormEvent, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage } from '../../lib/feedback';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/books';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) {
      return;
    }
    setLoading(true);
    try {
      await authApi.login(email, password);
      setModal({ isOpen: true, type: 'success', title: 'Sign In Successful', message: 'Welcome back.' });
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

  const onGoogleLogin = async () => {
    if (loading || googleLoading) {
      return;
    }
    setGoogleLoading(true);
    try {
      await authApi.loginWithGoogle();
      // Supabase redirects the browser — no navigate() needed
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Google Sign In Failed',
        message: getFriendlyErrorMessage(err, 'Unable to continue with Google right now.')
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#f8faff]">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1e3a8a] shadow-lg shadow-[#1e3a8a]/30 mb-5">
            <span className="text-white text-2xl">✝</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-[#1e3a8a] mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your David Jenkins account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a8a]/8 border border-[#d1e4ff] p-8 space-y-5">

          {/* Google Login */}
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-semibold py-3 text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {/* Google "G" logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400">or sign in with email</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1e3a8a]">Email address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1e3a8a]">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl bg-[#1e3a8a] hover:bg-[#163080] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400">Don't have an account?</span></div>
          </div>

          <Link
            to="/register"
            className="block w-full text-center rounded-xl border-2 border-[#d1e4ff] hover:border-blue-400 text-[#1e3a8a] hover:bg-[#eff6ff] font-bold py-3 text-sm no-underline transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.type === 'success' ? 'Continue' : 'Close'}
        onConfirm={() => {
          const wasSuccess = modal.type === 'success';
          setModal((prev) => ({ ...prev, isOpen: false }));
          if (wasSuccess) {
            navigate(nextPath);
          }
        }}
      />
    </div>
  );
};
