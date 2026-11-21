import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: owned } = await supabaseAdmin
    .from('id_tenants')
    .select('id, name, subscription_status, trial_ends_at')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  let tenant = owned;
  if (!tenant) {
    const { data: membership } = await supabaseAdmin
      .from('id_tenant_memberships')
      .select('id_tenants(id, name, subscription_status, trial_ends_at)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    const joined = membership?.id_tenants;
    tenant = Array.isArray(joined) ? (joined[0] ?? null) : (joined ?? null);
  }

  if (!tenant) {
    redirect('/onboarding');
  }

  const active = isTenantSubscriptionActive(tenant);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/overview">
              <IntakeDockLogo />
            </Link>
            <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/overview" className="hover:text-slate-950">
                Requests
              </Link>
              <Link href="/requests/new" className="hover:text-slate-950">
                New Request
              </Link>
              <Link href="/billing" className="hover:text-slate-950">
                Billing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 hidden md:inline">
              {tenant.name} &middot;{' '}
              <span className={active ? 'text-emerald-700' : 'text-red-600'}>
                {tenant.subscription_status}
              </span>
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
