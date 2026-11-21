import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileCheck2,
  FolderArchive,
  Link2,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-950">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <IntakeDockLogo />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600">
            <Link href="/pricing" className="hover:text-slate-950 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-slate-950 transition-colors">
              Sign in
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-slate-950 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Start 14-day trial
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Self-Serve B2B Client Onboarding &amp; Document Workflow Software
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                Stop chasing client documents across WhatsApp and email threads.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Send your client one secure, no-login portal link. IntakeDock checks file
                legibility automatically, sends polite follow-ups, and exports an organized ZIP or
                PDF dossier in one click.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Start 14-day free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  View USD &amp; EUR pricing
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  No client password required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  Flat-rate pricing (no per-seat tax)
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  14-day free trial
                </span>
              </div>
            </div>

            {/* Clean Portal Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Client Portal Preview
                    </p>
                    <p className="text-sm font-bold text-slate-950">2026 Tax &amp; Onboarding Pack</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    2 / 3 Received
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">1. Government Photo ID</p>
                      <p className="text-xs text-emerald-700">Legible &amp; unexpired &middot; Stored in vault</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                      Approved
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-300 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">2. Bank Statements (3 mo)</p>
                      <p className="text-xs text-amber-700">Edge cropped — please re-upload clear PDF</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-amber-800">
                      Re-upload
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">3. Signed Engagement Letter</p>
                      <p className="text-xs text-slate-500">PDF, JPEG, PNG or WebP up to 15 MB</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Features */}
        <section className="border-t border-slate-200 bg-[#F8FAFC] py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Built for Accounting, Legal, Real Estate &amp; HR
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Everything needed to collect complete client files on time.
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
                <Link2 className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-950">No-Login Magic Links</h3>
                <p className="text-sm text-slate-600">
                  Clients open a 256-bit encrypted link on mobile and upload in 60 seconds without
                  creating an account.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
                <FileCheck2 className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-950">AI Quality Pre-Check</h3>
                <p className="text-sm text-slate-600">
                  Detects blurry photos, cropped corners, wrong files, and expiry dates immediately
                  on upload.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
                <Lock className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-950">Write-Only Private Vault</h3>
                <p className="text-sm text-slate-600">
                  Files are validated by magic bytes, isolated per firm, and accessed only via
                  60-second signed URLs.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3">
                <FolderArchive className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-950">1-Click ZIP &amp; PDF Pack</h3>
                <p className="text-sm text-slate-600">
                  Export every approved document cleanly renamed alongside an audit index PDF.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} GilByte Solutions &middot; IntakeDock</span>
            <a
              href="mailto:gilbytesolutions@hotmail.com"
              className="inline-flex items-center gap-1 hover:text-slate-950"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact: gilbytesolutions@hotmail.com
            </a>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="hover:text-slate-950">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-slate-950">
              Terms &amp; Refund Policy
            </Link>
            <Link href="/privacy" className="hover:text-slate-950">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
