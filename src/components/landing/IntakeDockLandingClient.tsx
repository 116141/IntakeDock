'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileCheck2,
  FolderArchive,
  Globe,
  Link2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export function IntakeDockLandingClient() {
  const [lang, setLang] = useState<'en' | 'pt'>('en');
  const [openFaq, setOpenFaq] = useState<number>(0);
  const pt = lang === 'pt';

  const faqs = [
    {
      q: pt ? 'O meu cliente precisa criar conta ou palavra-passe?' : 'Does my client need an account or password?',
      a: pt
        ? 'Não. Cada pedido gera um Magic Link encriptado de 256 bits (/p/...) onde o cliente envia os ficheiros em 60 segundos.'
        : 'No. Every request generates a 256-bit encrypted Magic Link (/p/...) where clients upload in 60 seconds.',
    },
    {
      q: pt ? 'Como funciona a verificação por IA?' : 'How does the AI quality pre-check work?',
      a: pt
        ? 'Ao carregar uma foto ou PDF, a IA deteta automaticamente imagens desfocadas, cantos cortados ou documentos errados antes de aceitar.'
        : 'On upload, AI automatically flags blurry photos, cropped edges, or wrong document types before accepting.',
    },
    {
      q: pt ? 'Os ficheiros ficam seguros e isolados?' : 'Are client documents stored securely?',
      a: pt
        ? 'Sim. Ficam num cofre privado isolado por empresa e só são acedidos por URLs temporários de 60 segundos.'
        : 'Yes. Files live in a firm-isolated private vault and are accessed only via 60-second signed URLs.',
    },
    {
      q: pt ? 'Posso exportar tudo de uma só vez?' : 'Can I export the entire client pack at once?',
      a: pt
        ? 'Sim. Em 1 clique descarrega um ZIP organizado com todos os ficheiros renomeados e índice de auditoria em PDF.'
        : 'Yes. Export a 1-click organized ZIP dossier with cleanly renamed files and an audit index PDF.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5FF] text-[#1B1340]">
      <div className="bg-[#1B1340] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-white/90 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-[#6D4AFF] text-[10px] font-bold uppercase tracking-wide text-white">
              GilByte Suite
            </span>
            <span>
              {pt
                ? 'Privado por concepção • Portais encriptados sem palavra-passe'
                : 'Private by design • Passwordless encrypted client portals'}
            </span>
          </span>
          <a
            href="https://gilbyte-landing-page.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C4B5FD] hover:text-white font-semibold transition"
          >
            {pt ? 'Ver os 3 produtos →' : 'Explore all 3 apps →'}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#EAE6F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <IntakeDockLogo />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-[#4A4660]">
            <button
              type="button"
              onClick={() => setLang(pt ? 'en' : 'pt')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAE6F5] bg-white text-xs font-semibold text-[#372580] hover:border-[#6D4AFF]/40 transition"
            >
              <Globe className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>{pt ? 'PT' : 'EN'}</span>
            </button>
            <Link href="/pricing" className="hover:text-[#1B1340] transition-colors hidden sm:inline">
              {pt ? 'Preços' : 'Pricing'}
            </Link>
            <Link href="/login" className="hover:text-[#1B1340] transition-colors">
              {pt ? 'Entrar' : 'Sign in'}
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-[#6D4AFF] text-white text-xs sm:text-sm font-semibold hover:bg-[#4A2DC5] transition-colors shadow-sm"
            >
              {pt ? 'Testar 14 dias grátis' : 'Start 14-day trial'}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2DBFF] border border-[#DDD3FF] text-[#5B38E8] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {pt
                  ? 'Portal B2B Seguro de Recolha e Validação de Documentos'
                  : 'Self-Serve B2B Client Onboarding & Document Workflow Software'}
              </div>

              <h1 className="font-proton-serif text-4xl sm:text-5xl md:text-[54px] text-[#372580] leading-[1.08]">
                {pt
                  ? 'Pare de cobrar documentos perdidos no WhatsApp e e-mail.'
                  : 'Stop chasing client documents across WhatsApp and email threads.'}
              </h1>

              <p className="text-base sm:text-lg text-[#4A4660] leading-relaxed max-w-xl">
                {pt
                  ? 'Envie ao seu cliente um único link seguro sem palavra-passe. O IntakeDock verifica a nitidez por IA automaticamente e exporta tudo em ZIP ou PDF num clique.'
                  : 'Send your client one secure, no-login portal link. IntakeDock checks file legibility automatically, sends polite follow-ups, and exports an organized ZIP or PDF dossier in one click.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6D4AFF] text-white text-base font-semibold hover:bg-[#4A2DC5] transition-colors shadow-sm"
                >
                  {pt ? 'Começar 14 dias grátis' : 'Start 14-day free trial'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-transparent text-[#6D4AFF] text-base font-semibold shadow-[inset_0_0_0_2px_#6D4AFF] hover:bg-[#4A2DC5] hover:text-white transition-colors"
                >
                  {pt ? 'Ver preços USD & EUR' : 'View USD & EUR pricing'}
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#5C5873] pt-1">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6D4AFF]" />
                  {pt ? 'Sem palavra-passe para o cliente' : 'No client password required'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6D4AFF]" />
                  {pt ? 'Preço fixo ($29 USD / €25 EUR)' : 'Flat-rate pricing (no per-seat tax)'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#6D4AFF]" />
                  {pt ? '14 dias de teste grátis' : '14-day free trial'}
                </span>
              </div>
            </div>

            {/* Clean Portal Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#EAE6F5] bg-white p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EAE6F5] pb-3">
                  <div>
                    <p className="text-xs font-semibold text-[#5C5873] uppercase tracking-wider">
                      Client Portal Preview
                    </p>
                    <p className="text-sm font-bold text-[#1B1340]">2026 Tax &amp; Onboarding Pack</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    2 / 3 Received
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#F7F5FF] border border-[#EAE6F5] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1B1340]">1. Government Photo ID</p>
                      <p className="text-xs text-emerald-700">Legible &amp; unexpired &middot; Stored in vault</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">
                      Approved
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7F5FF] border border-amber-300 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1B1340]">2. Bank Statements (3 mo)</p>
                      <p className="text-xs text-amber-700">Edge cropped — please re-upload clear PDF</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-amber-800">
                      Re-upload
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7F5FF] border border-[#EAE6F5] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1B1340]">3. Signed Engagement Letter</p>
                      <p className="text-xs text-[#5C5873]">PDF, JPEG, PNG or WebP up to 15 MB</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-white text-[#5C5873]">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Features */}
        <section className="border-t border-[#EAE6F5] bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-10 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6D4AFF]">
                {pt
                  ? 'Para Contabilidade, Advocacia, Imobiliárias & RH'
                  : 'Built for Accounting, Legal, Real Estate & HR'}
              </p>
              <h2 className="font-proton-serif text-3xl sm:text-4xl text-[#372580]">
                {pt
                  ? 'Tudo o que precisa para receber processos completos a tempo.'
                  : 'Everything needed to collect complete client files on time.'}
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#F7F5FF] border border-[#EAE6F5] space-y-3">
                <Link2 className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="font-bold text-[#1B1340]">No-Login Magic Links</h3>
                <p className="text-sm text-[#4A4660]">
                  Clients open a 256-bit encrypted link on mobile and upload in 60 seconds without creating an account.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F7F5FF] border border-[#EAE6F5] space-y-3">
                <FileCheck2 className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="font-bold text-[#1B1340]">AI Quality Pre-Check</h3>
                <p className="text-sm text-[#4A4660]">
                  Detects blurry photos, cropped corners, wrong files, and expiry dates immediately on upload.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F7F5FF] border border-[#EAE6F5] space-y-3">
                <Lock className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="font-bold text-[#1B1340]">Write-Only Private Vault</h3>
                <p className="text-sm text-[#4A4660]">
                  Files are validated by magic bytes, isolated per firm, and accessed only via 60-second signed URLs.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#F7F5FF] border border-[#EAE6F5] space-y-3">
                <FolderArchive className="w-5 h-5 text-[#6D4AFF]" />
                <h3 className="font-bold text-[#1B1340]">1-Click ZIP &amp; PDF Pack</h3>
                <p className="text-sm text-[#4A4660]">
                  Export every approved document cleanly renamed alongside an audit index PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROTON-STYLE 2-COLUMN FAQ */}
        <section className="bg-white border-t border-[#EAE6F5] py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
            <h2 className="font-proton-serif text-3xl sm:text-4xl text-[#372580]">
              {pt ? 'Perguntas frequentes' : 'Frequently asked questions'}
            </h2>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="border-b border-[#EAE6F5] py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-bold text-[#372580]">{item.q}</span>
                      <span
                        className={`w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 transition ${
                          isOpen ? 'bg-[#6D4AFF] text-white' : 'bg-[#F7F5FF] text-[#6D4AFF]'
                        }`}
                      >
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && <p className="mt-2.5 text-xs sm:text-sm text-[#4A4660] leading-relaxed">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* PROTON-STYLE MULTI-COLUMN FOOTER */}
      <footer className="border-t border-[#EAE6F5] bg-[#F7F5FF] pt-14 pb-8 px-4 text-xs text-[#5C5873]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2.5">
              <div className="font-bold text-[#372580]">IntakeDock</div>
              <p>{pt ? 'Recolha encriptada de documentos' : 'Encrypted client intake'}</p>
              <p>GilByte Solutions</p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#372580]">{pt ? 'Suíte GilByte' : 'GilByte Suite'}</div>
              <a href="https://gilbyte-landing-page.vercel.app" target="_blank" rel="noopener noreferrer" className="block hover:text-[#6D4AFF]">
                GilByte Portal
              </a>
              <a href="https://bookgrid-iota.vercel.app" target="_blank" rel="noopener noreferrer" className="block hover:text-[#6D4AFF]">
                BookGrid
              </a>
              <a href="https://smart-biz-chat.vercel.app" target="_blank" rel="noopener noreferrer" className="block hover:text-[#6D4AFF]">
                SmartBizChat
              </a>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#372580]">{pt ? 'Produto' : 'Product'}</div>
              <Link href="/pricing" className="block hover:text-[#6D4AFF]">
                {pt ? 'Preços' : 'Pricing'}
              </Link>
              <Link href="/login" className="block hover:text-[#6D4AFF]">
                {pt ? 'Entrar' : 'Sign in'}
              </Link>
              <Link href="/terms" className="block hover:text-[#6D4AFF]">
                Terms
              </Link>
              <Link href="/privacy" className="block hover:text-[#6D4AFF]">
                Privacy
              </Link>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-[#372580]">{pt ? 'Contacto' : 'Connect'}</div>
              <a href="mailto:gilbytesolutions@hotmail.com" className="block hover:text-[#6D4AFF]">
                gilbytesolutions@hotmail.com
              </a>
              <a href="https://wa.me/2389172385" target="_blank" rel="noopener noreferrer" className="block hover:text-[#6D4AFF]">
                WhatsApp: +238 917 2385
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EAE6F5] flex flex-wrap items-center justify-between gap-3">
            <span>&copy; {new Date().getFullYear()} GilByte Solutions &middot; IntakeDock</span>
            <button
              type="button"
              onClick={() => setLang(pt ? 'en' : 'pt')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#6D4AFF]/40 text-[#372580] font-semibold hover:bg-white transition"
            >
              <Globe className="w-3.5 h-3.5 text-[#6D4AFF]" />
              {pt ? 'Português' : 'English'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
