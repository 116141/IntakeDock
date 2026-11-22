'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  FilePlus2,
  FolderKanban,
  LayoutGrid,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

interface IntakeDockSidebarProps {
  readonly tenantName: string;
  readonly subscriptionStatus: string;
  readonly active: boolean;
}

const NAV_ITEMS = [
  { href: '/overview', label: 'Requests', Icon: FolderKanban },
  { href: '/requests/new', label: 'New Request', Icon: FilePlus2 },
  { href: '/billing', label: 'Billing', Icon: CreditCard },
] as const;

const SUITE_LINKS = [
  { name: 'IntakeDock', desc: 'Secure Document Vault', href: 'https://intakedock-liart.vercel.app', current: true },
  { name: 'BookGrid', desc: 'Scheduling & Waitlist', href: 'https://bookgrid-iota.vercel.app', current: false },
  { name: 'SmartBizChat', desc: '24/7 AI Knowledge Chat', href: 'https://smart-biz-chat.vercel.app', current: false },
  { name: 'GilByte Portal', desc: 'Official Suite Home', href: 'https://gilbyte-landing-page.vercel.app', current: false },
] as const;

export function IntakeDockSidebar({
  tenantName,
  subscriptionStatus,
  active,
}: IntakeDockSidebarProps) {
  const pathname = usePathname();
  const [suiteOpen, setSuiteOpen] = useState(false);

  return (
    <>
      {/* DESKTOP PROTON-STYLE DARK SIDEBAR */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 bg-[#1B1340] text-white border-r border-white/10 z-40">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between gap-2 relative">
            <Link href="/overview" className="min-w-0 bg-white rounded-xl px-2.5 py-1.5 inline-flex items-center">
              <IntakeDockLogo />
            </Link>

            <button
              type="button"
              onClick={() => setSuiteOpen((prev) => !prev)}
              aria-label="GilByte Suite Switcher"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
            </button>

            {suiteOpen && (
              <div className="absolute left-0 top-12 w-60 rounded-2xl border border-[#EAE6F5] bg-white text-[#1B1340] shadow-xl p-2 z-50">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5C5873]">
                  GilByte Suite
                </div>
                {SUITE_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.current ? undefined : '_blank'}
                    rel={item.current ? undefined : 'noopener noreferrer'}
                    onClick={() => setSuiteOpen(false)}
                    className={`block px-2.5 py-2 rounded-xl transition ${
                      item.current ? 'bg-[#EFEAFF] text-[#5B38E8]' : 'hover:bg-[#F8F7FC]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.name}</div>
                    <div className="text-[11px] text-[#5C5873]">{item.desc}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/requests/new"
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5B38E8] text-white text-xs font-semibold transition shadow-sm"
          >
            <FilePlus2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>New Request</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isCurrent = pathname === href || (href !== '/overview' && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  isCurrent
                    ? 'bg-[#261C54] text-white font-semibold border border-white/10'
                    : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isCurrent ? 'text-[#A78BFA]' : 'text-white/60'}`}
                  strokeWidth={1.75}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2.5">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs font-semibold text-white truncate">{tenantName}</p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-white/70">
              <ShieldCheck className="w-3 h-3 text-[#A78BFA]" />
              <span className={active ? 'text-emerald-300' : 'text-amber-300'}>
                {subscriptionStatus}
              </span>
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-30 bg-[#1B1340] text-white border-b border-white/10">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/overview" className="bg-white rounded-lg px-2 py-1 inline-flex items-center">
            <IntakeDockLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/requests/new"
              className="px-3 py-1.5 rounded-lg bg-[#6D4AFF] text-white text-xs font-semibold"
            >
              + New
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/10 text-xs font-semibold text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#EAE6F5] bg-white grid grid-cols-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isCurrent = pathname === href || (href !== '/overview' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={`py-2.5 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                isCurrent ? 'text-[#6D4AFF]' : 'text-[#5C5873]'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={isCurrent ? 2.25 : 1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
