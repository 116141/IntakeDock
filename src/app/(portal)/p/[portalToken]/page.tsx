import { Lock, ShieldCheck } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hashPortalToken } from '@/lib/security/tokens';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';
import { IntakeDockLogo } from '@/components/brand/IntakeDockLogo';
import { PortalUploadClient } from './PortalUploadClient';

export default async function ClientPortalPage(context: {
  params: Promise<{ portalToken: string }>;
}) {
  const { portalToken } = await context.params;
  const tokenHash = hashPortalToken(portalToken);
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: reqRow } = await supabaseAdmin
    .from('id_client_requests')
    .select(
      'id, title, client_name, token_expires_at, token_revoked_at, id_tenants(name, contact_email, subscription_status, trial_ends_at)'
    )
    .eq('portal_token_hash', tokenHash)
    .maybeSingle();

  const tenant = reqRow
    ? Array.isArray(reqRow.id_tenants)
      ? reqRow.id_tenants[0]
      : reqRow.id_tenants
    : null;

  const isExpiredOrRevoked =
    !reqRow ||
    Boolean(reqRow.token_revoked_at) ||
    new Date(reqRow.token_expires_at).getTime() <= Date.now();

  if (isExpiredOrRevoked || !tenant || !isTenantSubscriptionActive(tenant)) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#EAE6F5] rounded-2xl p-8 text-center space-y-3">
          <Lock className="w-8 h-8 text-slate-400 mx-auto" />
          <h1 className="text-lg font-bold text-slate-950">Portal Link Unavailable</h1>
          <p className="text-sm text-slate-500">
            This document request link has expired or been revoked. Please contact the sender for a
            new link.
          </p>
        </div>
      </div>
    );
  }

  const { data: items } = await supabaseAdmin
    .from('id_request_items')
    .select('id, title, instructions_for_client, status, rejection_reason, sort_order')
    .eq('request_id', reqRow.id)
    .order('sort_order', { ascending: true });

  const { data: subs } = await supabaseAdmin
    .from('id_document_submissions')
    .select('request_item_id, ai_client_feedback')
    .eq('request_id', reqRow.id)
    .eq('is_current', true);

  const feedbackByItem = new Map((subs ?? []).map((s) => [s.request_item_id, s.ai_client_feedback]));

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-950 flex flex-col">
      <header className="bg-white border-b border-[#EAE6F5]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <IntakeDockLogo size={24} />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            Encrypted Write-Only Portal
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-white border border-[#EAE6F5] rounded-2xl p-6 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Requested by {tenant.name}
          </p>
          <h1 className="text-2xl font-bold text-slate-950">{reqRow.title}</h1>
          <p className="text-sm text-slate-600">
            Hi {reqRow.client_name}, upload each required item below. Previously uploaded files are
            locked in the firm&apos;s private vault for your privacy.
          </p>
        </div>

        <PortalUploadClient
          portalToken={portalToken}
          initialItems={(items ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            instructions_for_client: item.instructions_for_client,
            status: item.status,
            rejection_reason: item.rejection_reason,
            ai_feedback: feedbackByItem.get(item.id) ?? null,
          }))}
        />
      </main>
    </div>
  );
}
