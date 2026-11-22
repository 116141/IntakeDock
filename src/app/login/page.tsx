'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authErr) {
        setError(authErr.message);
        setLoading(false);
      }
    } catch {
      setError('Unable to initialize Google sign-in.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === 'signin') {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInErr) {
          setError(signInErr.message);
          setLoading(false);
          return;
        }
        router.push('/overview');
        router.refresh();
        return;
      }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/onboarding');
        router.refresh();
        return;
      }

      setMessage('Check your email inbox to confirm your account, then sign in.');
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#EAE6F5] rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <IntakeDockLogo />
          </Link>
          <h1 className="text-xl font-bold text-slate-950 pt-2">
            {mode === 'signin' ? 'Sign in to your workspace' : 'Create your firm account'}
          </h1>
          <p className="text-sm text-slate-500">
            Start your 14-day free trial or access your firm dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
            <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-[#EAE6F5]" />
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">
            or with work email
          </span>
          <div className="flex-grow border-t border-[#EAE6F5]" />
        </div>

        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-[#EAE6F5] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'signin' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setMessage(null);
            }}
            className={`py-2 rounded-lg transition-colors ${
              mode === 'signup' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Work Email</label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-[#5B38E8] text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
                ? 'Sign in with Email'
                : 'Create Account (14-day Trial)'}
          </button>
        </form>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
