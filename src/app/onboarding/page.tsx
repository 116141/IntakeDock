'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          contactEmail,
          defaultCurrency: currency,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to create workspace');
        setLoading(false);
        return;
      }
      router.push('/overview');
      router.refresh();
    } catch {
      setError('Network error while creating workspace');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-[#EAE6F5] rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="space-y-2">
          <IntakeDockLogo />
          <h1 className="text-2xl font-bold text-slate-950 pt-2">Set up your firm workspace</h1>
          <p className="text-sm text-slate-500">
            Includes 14-day free trial and 4 ready-to-use onboarding checklist templates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Firm / Company Name</label>
            <input
              type="text"
              required
              placeholder="Acme Accounting LLP"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Workspace Slug</label>
            <input
              type="text"
              required
              placeholder="acme-accounting"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm font-mono focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Support / Reply-To Email</label>
            <input
              type="email"
              required
              placeholder="onboarding@acmeaccounting.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE6F5] bg-[#F8F7FC] text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Billing Currency</label>
            <div className="grid grid-cols-2 gap-3">
              {(['USD', 'EUR'] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    currency === cur
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-[#EAE6F5] bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cur === 'USD' ? 'USD ($)' : 'EUR (€)'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating workspace...' : 'Launch 14-day free trial'}
          </button>
        </form>
      </div>
    </div>
  );
}
