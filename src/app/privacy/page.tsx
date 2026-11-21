import Link from 'next/link';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-extrabold text-slate-950">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: November 2026 &middot; GilByte Solutions</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">1. Multi-Tenant Isolation &amp; Private Storage</h2>
          <p>
            All client documents uploaded via IntakeDock are stored in private, encrypted object
            storage isolated by workspace ID and protected by PostgreSQL Row-Level Security (RLS).
            External portal links use 256-bit cryptographic tokens stored exclusively as SHA-256
            hashes. Files are never exposed on public URLs and are accessed only via 60-second
            signed URLs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">2. AI Quality Checks &amp; Zero-Training</h2>
          <p>
            Automated legibility and document-type checks are processed through paid enterprise AI
            API endpoints under zero-training data processing terms. Submitted documents are never
            used to train public AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-950">3. Data Deletion &amp; GDPR Rights</h2>
          <p>
            Workspaces can delete requests and purge stored files at any time, or contact{' '}
            <a href="mailto:gilbytesolutions@hotmail.com" className="underline">
              gilbytesolutions@hotmail.com
            </a>{' '}
            for complete data removal under GDPR Article 17.
          </p>
        </section>
      </main>
    </div>
  );
}
