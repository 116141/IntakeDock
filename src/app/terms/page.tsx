import Link from 'next/link';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <IntakeDockLogo />
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            Pricing
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-950">Terms of Service</h1>
        <p className="text-slate-500">Last updated: November 2026 &middot; GilByte Solutions</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">1. Service Scope</h2>
          <p>
            IntakeDock is a self-serve B2B client onboarding and document collection workflow
            platform operated by GilByte Solutions. IntakeDock does not provide regulated legal,
            accounting, or identity verification services; customers remain responsible for final
            review and acceptance of client documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">2. Subscriptions &amp; 14-Day Refund Policy</h2>
          <p>
            Every new workspace receives a 14-day free trial. Paid subscriptions are billed monthly
            in USD or EUR via our Merchant of Record (Paddle or Dodo Payments). You may cancel your
            subscription at any time from the Billing page. In addition to the 14-day free trial, we
            offer a full 14-day refund on your initial subscription charge if you contact{' '}
            <a href="mailto:gilbytesolutions@hotmail.com" className="underline">
              gilbytesolutions@hotmail.com
            </a>{' '}
            within 14 calendar days of the charge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">3. Customer Data &amp; Acceptable Use</h2>
          <p>
            You retain full ownership of all checklists and documents collected through your
            workspace. Uploading illegal content, malware, or unauthorized third-party data is
            strictly prohibited.
          </p>
        </section>
      </main>
    </div>
  );
}
