import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { ActionModal } from '../../components/feedback/ActionModal';
import { getFriendlyErrorMessage, getRetryAtFromRateLimitError } from '../../lib/feedback';
import { env } from '../../lib/env';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryAt, setRetryAt] = useState<Date | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/books';
  const isCooldownActive = !!retryAt && nowMs < retryAt.getTime();
  const retryTimeLabel = useMemo(() => (retryAt ? retryAt.toLocaleTimeString() : ''), [retryAt]);
  const passwordChecks = useMemo(
    () => [
      { label: 'At least 8 characters', valid: password.length >= 8 },
      { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
      { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
      { label: 'One number (0-9)', valid: /\d/.test(password) },
      { label: 'One special character (!@#$...)', valid: /[^A-Za-z\d]/.test(password) }
    ],
    [password]
  );

  useEffect(() => {
    if (!isCooldownActive) {
      return;
    }

    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isCooldownActive]);

  useEffect(() => {
    if (!env.TURNSTILE_SITE_KEY) {
      return;
    }

    const renderWidget = () => {
      const turnstile = (window as unknown as { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string } }).turnstile;
      if (!turnstile || !turnstileRef.current || turnstileWidgetId.current) {
        return;
      }

      turnstileWidgetId.current = turnstile.render(turnstileRef.current, {
        sitekey: env.TURNSTILE_SITE_KEY,
        callback: (token: string) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(null),
        'error-callback': () => setCaptchaToken(null)
      });
    };

    const existing = document.getElementById('turnstile-script');
    if (existing) {
      renderWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.body.appendChild(script);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || isCooldownActive) {
      return;
    }
    setRetryAt(null);

    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPasswordPattern.test(password)) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Weak Password',
        message: 'Use at least 8 characters with uppercase, lowercase, number, and special character.'
      });
      return;
    }

    if (password !== confirmPassword) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'Password and confirm password do not match.'
      });
      return;
    }

    if (env.TURNSTILE_SITE_KEY && !captchaToken) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Captcha Required',
        message: 'Please complete the captcha before creating your account.'
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.register(email, password, fullName, captchaToken ?? undefined);
      setModal({ isOpen: true, type: 'success', title: 'Account Created', message: 'Your account is ready to use.' });
    } catch (err) {
      const retryDate = getRetryAtFromRateLimitError(err);
      if (retryDate) {
        setRetryAt(retryDate);
      } else {
        setRetryAt(null);
      }

      const friendly = getFriendlyErrorMessage(err, 'Unable to create your account right now.');
      const withRetryTime = retryDate
        ? /try again/i.test(friendly)
          ? `${friendly} Retry time: ${retryDate.toLocaleTimeString()}.`
          : `${friendly} Please try again at ${retryDate.toLocaleTimeString()}.`
        : friendly;
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Failed',
        message: withRetryTime
      });
    } finally {
      setLoading(false);
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
          <h1 className="font-heading text-3xl font-black text-[#1e3a8a] mb-1">Create account</h1>
          <p className="text-slate-500 text-sm">Join the David Jenkins community</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#1e3a8a]/8 border border-[#d1e4ff] p-8 space-y-5">

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1e3a8a]">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              />
            </div>

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
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1e3a8a]">Confirm password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            <div className="rounded-xl border border-[#d1e4ff] bg-[#eff6ff] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1e3a8a]">Strong password recommendation</p>
              <ul className="mt-2 space-y-1.5">
                {passwordChecks.map((rule) => (
                  <li key={rule.label} className={`flex items-center gap-2 text-xs ${rule.valid ? 'text-green-700' : 'text-slate-600'}`}>
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        rule.valid ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {rule.valid ? '✓' : '•'}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            {env.TURNSTILE_SITE_KEY && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div ref={turnstileRef} />
                <p className="mt-2 text-xs text-slate-500">Complete captcha verification to continue.</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isCooldownActive}
              className="w-full rounded-xl bg-[#1e3a8a] hover:bg-[#163080] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 text-sm transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Creating account…' : isCooldownActive ? `Try Again at ${retryTimeLabel}` : 'Create Account'}
            </button>
            {isCooldownActive && (
              <p className="text-xs text-amber-600 font-medium">Rate limit active. Please try again at {retryTimeLabel}.</p>
            )}
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400">Already have an account?</span></div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center rounded-xl border-2 border-[#d1e4ff] hover:border-blue-400 text-[#1e3a8a] hover:bg-[#eff6ff] font-bold py-3 text-sm no-underline transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
      <ActionModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.type === 'success' ? 'Continue' : 'Try Again'}
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
