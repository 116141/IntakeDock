import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';
import { OverviewClient, type OverviewRequestRow } from '@/components/dashboard/OverviewClient';

export default async function OverviewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tenant } = await supabaseAdmin
    .from('id_tenants')
    .select('id, name, subscription_status, trial_ends_at')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (tenant && !isTenantSubscriptionActive(tenant)) {
    redirect('/billing?expired=1');
  }

  const { data: requests } = await supabase
    .from('id_client_requests')
    .select('id, title, client_name, client_email, status, created_at, id_request_items(status)')
    .order('created_at', { ascending: false });

  const rows: readonly OverviewRequestRow[] = requests ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1340] tracking-tight">Client Requests</h1>
          <p className="text-sm text-[#5C5873]">
            Track document collection progress and review AI-checked submissions.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D4AFF] text-white text-sm font-semibold hover:bg-[#5B38E8] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Client Request
        </Link>
      </div>

      <OverviewClient requests={rows} />
    </div>
  );
}
