import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';
import { IntakeDockSidebar } from '@/components/dashboard/IntakeDockSidebar';

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
    <div className="min-h-screen bg-[#F8F7FC] text-[#0C0C14] flex flex-col pb-20 md:pb-0 md:pl-64">
      <IntakeDockSidebar
        tenantName={tenant.name}
        subscriptionStatus={tenant.subscription_status}
        active={active}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
