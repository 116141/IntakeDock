import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-950 flex flex-col">
      <header className="bg-white border-b border-[#EAE6F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <IntakeDockLogo />
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-[#6D4AFF] text-white text-xs font-semibold hover:bg-[#4A2DC5] transition"
          >
            Start 14-day free trial
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-proton-serif text-4xl sm:text-5xl text-[#372580]">
            Simple flat-rate pricing in USD &amp; EUR
          </h1>
          <p className="text-[#5C5873]">
            Start with a 14-day free trial. No credit card required upfront. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          <div className="rounded-2xl bg-white border border-[#EAE6F5] p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-proton-serif text-2xl text-[#372580]">Starter</h2>
                <span className="rounded-md bg-[#E2DBFF] text-[#6D4AFF] px-3 py-1 text-xs font-bold uppercase">
                  14 Days Free
                </span>
              </div>
              <p className="text-sm text-[#5C5873]">
                For solo accountants, lawyers, realtors &amp; consultants
              </p>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[#1B1340]">
                  $29 USD <span className="text-base font-medium text-[#5C5873]">/ month</span>
                </p>
                <p className="text-sm font-semibold text-[#6D4AFF]">or 25 € EUR / month</p>
              </div>
              <ul className="space-y-2.5 text-sm text-[#4A4660] pt-3 border-t border-[#EAE6F5]">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  14-day free trial included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  Up to 5 team members included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  Up to 50 active client portals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  AI document legibility &amp; expiry pre-check
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  1-click ZIP &amp; PDF dossier export
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full py-3 rounded-full bg-transparent text-[#6D4AFF] text-center text-base font-semibold shadow-[inset_0_0_0_2px_#6D4AFF] hover:bg-[#4A2DC5] hover:text-white transition-colors"
            >
              Start Starter Trial
            </Link>
          </div>

          <div className="rounded-2xl bg-white border-2 border-[#6D4AFF] overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="bg-[#6D4AFF] px-4 py-2 text-center text-white text-xs font-bold uppercase tracking-widest">
              Recommended
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-proton-serif text-2xl text-[#372580]">Studio</h2>
                  <span className="rounded-md bg-[#E2DBFF] text-[#6D4AFF] px-3 py-1 text-xs font-bold uppercase">
                    14 Days Free
                  </span>
                </div>
                <p className="text-sm text-[#5C5873]">
                  For growing firms handling high-volume client onboarding
                </p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-[#1B1340]">
                    $59 USD <span className="text-base font-medium text-[#5C5873]">/ month</span>
                  </p>
                  <p className="text-sm font-semibold text-[#6D4AFF]">or 55 € EUR / month</p>
                </div>
                <ul className="space-y-2.5 text-sm text-[#4A4660] pt-3 border-t border-[#EAE6F5]">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    14-day free trial included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    Up to 15 team members included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    Unlimited active client portals
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    50 GB private encrypted vault storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                    Configurable auto-purge &amp; full audit logs
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="w-full py-3 rounded-full bg-[#6D4AFF] text-white text-center text-base font-semibold hover:bg-[#4A2DC5] transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Studio Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
