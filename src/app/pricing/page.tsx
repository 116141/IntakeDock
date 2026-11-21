import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <IntakeDockLogo />
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Start 14-day free trial
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Simple flat-rate pricing in USD &amp; EUR
          </h1>
          <p className="text-slate-600">
            Start with a 14-day free trial. No credit card required upfront. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Starter</h2>
                <p className="text-sm text-slate-500 mt-1">
                  For solo accountants, lawyers, realtors &amp; consultants
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold">
                  $29 USD <span className="text-base font-medium text-slate-500">/ month</span>
                </p>
                <p className="text-sm font-semibold text-teal-700">or 25 € EUR / month</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  14-day free trial included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  Up to 5 team members included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  Up to 50 active client portals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  AI document legibility &amp; expiry pre-check
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  1-click ZIP &amp; PDF dossier export
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl border border-slate-300 text-center text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Start Starter Trial
            </Link>
          </div>

          <div className="rounded-2xl bg-white border-2 border-slate-950 p-8 flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-slate-950 text-white text-xs font-semibold">
              Recommended
            </span>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Studio</h2>
                <p className="text-sm text-slate-500 mt-1">
                  For growing firms handling high-volume client onboarding
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold">
                  $59 USD <span className="text-base font-medium text-slate-500">/ month</span>
                </p>
                <p className="text-sm font-semibold text-teal-700">or 55 € EUR / month</p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 pt-3 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  14-day free trial included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  Up to 15 team members included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  Unlimited active client portals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  50 GB private encrypted vault storage
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  Configurable auto-purge &amp; full audit logs
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-slate-950 text-white text-center text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              Start Studio Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          All plans include a 14-day money-back guarantee. Questions?{' '}
          <a href="mailto:gilbytesolutions@hotmail.com" className="underline">
            gilbytesolutions@hotmail.com
          </a>
        </p>
      </main>
    </div>
  );
}
