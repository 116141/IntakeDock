import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { BillingClient } from './BillingClient';

export default async function BillingPage(context: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const query = await context.searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tenant } = await supabaseAdmin
    .from('id_tenants')
    .select('id, default_currency, subscription_status, trial_ends_at')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!tenant) redirect('/onboarding');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Billing &amp; Subscription</h1>
        <p className="text-sm text-slate-500">
          Manage your IntakeDock plan in USD or EUR.
        </p>
      </div>

      {query.expired === '1' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-medium">
          Your 14-day free trial has ended. Choose a plan below to reactivate your workspace and
          client portals.
        </div>
      )}

      <BillingClient
        tenantId={tenant.id}
        defaultCurrency={tenant.default_currency === 'EUR' ? 'EUR' : 'USD'}
        subscriptionStatus={tenant.subscription_status}
        trialEndsAt={tenant.trial_ends_at}
      />
    </div>
  );
}
