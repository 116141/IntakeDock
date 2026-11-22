'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: {
          items: Array<{ priceId: string; quantity: number }>;
          customData?: Record<string, string>;
        }) => void;
      };
    };
  }
}

export function BillingClient({
  tenantId,
  defaultCurrency,
  subscriptionStatus,
  trialEndsAt,
}: {
  tenantId: string;
  defaultCurrency: 'USD' | 'EUR';
  subscriptionStatus: string;
  trialEndsAt: string;
}) {
  const [currency, setCurrency] = useState<'USD' | 'EUR'>(defaultCurrency);
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? '';

  useEffect(() => {
    if (window.Paddle && clientToken) {
      try {
        window.Paddle.Initialize({ token: clientToken });
      } catch {
        // Ignore re-init
      }
    }
  }, [clientToken]);

  const openCheckout = (planTier: 'starter' | 'studio') => {
    const priceMap = {
      starter: {
        USD: process.env.NEXT_PUBLIC_PADDLE_STARTER_USD ?? '',
        EUR: process.env.NEXT_PUBLIC_PADDLE_STARTER_EUR ?? '',
      },
      studio: {
        USD: process.env.NEXT_PUBLIC_PADDLE_STUDIO_USD ?? '',
        EUR: process.env.NEXT_PUBLIC_PADDLE_STUDIO_EUR ?? '',
      },
    };
    const priceId = priceMap[planTier][currency];
    if (window.Paddle && clientToken && priceId) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { tenant_id: tenantId, plan_tier: planTier },
      });
      return;
    }
    window.location.href = `mailto:gilbytesolutions@hotmail.com?subject=${encodeURIComponent(
      `IntakeDock ${planTier.toUpperCase()} (${currency})`
    )}`;
  };

  return (
    <div className="space-y-6">
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />

      <div className="bg-white border border-[#EAE6F5] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Status
          </p>
          <p className="text-lg font-bold text-slate-950 capitalize mt-0.5">
            {subscriptionStatus}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Trial ends: {new Date(trialEndsAt).toLocaleDateString()}
          </p>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-[#EAE6F5] self-start">
          {(['USD', 'EUR'] as const).map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => setCurrency(cur)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                currency === cur ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EAE6F5] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Starter</h2>
            <p className="text-2xl font-extrabold mt-1">
              {currency === 'USD' ? '$29 USD' : '25 € EUR'}{' '}
              <span className="text-sm font-normal text-slate-500">/ month</span>
            </p>
          </div>
          <p className="text-sm text-slate-600">Up to 5 team members, 50 active portals, AI checks.</p>
          <button
            type="button"
            onClick={() => openCheckout('starter')}
            className="w-full py-2.5 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-50"
          >
            Subscribe to Starter
          </button>
        </div>

        <div className="bg-white border-2 border-slate-950 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Studio</h2>
            <p className="text-2xl font-extrabold mt-1">
              {currency === 'USD' ? '$59 USD' : '55 € EUR'}{' '}
              <span className="text-sm font-normal text-slate-500">/ month</span>
            </p>
          </div>
          <p className="text-sm text-slate-600">Up to 15 team members, unlimited portals, 50 GB vault.</p>
          <button
            type="button"
            onClick={() => openCheckout('studio')}
            className="w-full py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Subscribe to Studio
          </button>
        </div>
      </div>
    </div>
  );
}
