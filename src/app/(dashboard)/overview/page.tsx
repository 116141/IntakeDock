import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, ArrowRight, FileText } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">Client Requests</h1>
          <p className="text-sm text-slate-500">
            Track document collection progress and review AI-checked submissions.
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D4AFF] text-white text-sm font-semibold hover:bg-[#5B38E8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Client Request
        </Link>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="bg-white border border-[#EAE6F5] rounded-2xl p-12 text-center space-y-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-950">No client requests yet</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first checklist request using a built-in template and send the no-login
              portal link to your client.
            </p>
          </div>
          <Link
            href="/requests/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D4AFF] text-white text-sm font-semibold hover:bg-[#5B38E8]"
          >
            Create first request
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#EAE6F5] rounded-2xl overflow-hidden divide-y divide-slate-200">
          {requests.map((req) => {
            const items = req.id_request_items ?? [];
            const doneCount = items.filter(
              (i) => i.status === 'ai_approved' || i.status === 'human_approved'
            ).length;

            return (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F7FC] transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-950">{req.title}</p>
                  <p className="text-xs text-slate-500">
                    {req.client_name} &middot; {req.client_email}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-slate-700">
                    {doneCount} / {items.length} approved
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                    {req.status.replace('_', ' ')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
