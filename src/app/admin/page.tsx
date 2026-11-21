import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';

export default async function SuperAdminPage() {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tenants } = await supabaseAdmin
    .from('id_tenants')
    .select('id, name, slug, contact_email, default_currency, plan_tier, subscription_status, trial_ends_at, created_at')
    .order('created_at', { ascending: false });

  const all = tenants ?? [];
  const activeCount = all.filter((t) => t.subscription_status === 'active').length;
  const trialCount = all.filter((t) => t.subscription_status === 'trial').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <IntakeDockLogo />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pt-1">
            Super Admin Command Center
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-500">Total Workspaces</p>
          <p className="text-3xl font-extrabold text-slate-950 mt-1">{all.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-500">Active Paid</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-500">Active Trials</p>
          <p className="text-3xl font-extrabold text-slate-950 mt-1">{trialCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-950">Registered Workspaces</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {all.map((t) => (
            <div key={t.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-semibold text-slate-950">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {t.slug} &middot; {t.contact_email} &middot; {t.default_currency}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">{t.plan_tier}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                  {t.subscription_status}
                </span>
              </div>
            </div>
          ))}
          {all.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No workspaces registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
