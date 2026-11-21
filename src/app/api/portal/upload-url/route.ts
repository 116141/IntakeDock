import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hashPortalToken } from '@/lib/security/tokens';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';
import { UploadUrlRequestSchema } from '@/schemas/intake.schema';
import { createQuarantineUploadUrl } from '@/services/storage/vault.service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = UploadUrlRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid upload request', issues: parsed.error.issues }, { status: 400 });
  }

  const { portalToken, requestItemId, mimeType } = parsed.data;
  const tokenHash = hashPortalToken(portalToken);
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: reqRow } = await supabaseAdmin
    .from('id_client_requests')
    .select('id, tenant_id, token_expires_at, token_revoked_at, id_tenants(subscription_status, trial_ends_at)')
    .eq('portal_token_hash', tokenHash)
    .maybeSingle();

  if (!reqRow || reqRow.token_revoked_at || new Date(reqRow.token_expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Portal link expired or invalid' }, { status: 403 });
  }

  const tenant = Array.isArray(reqRow.id_tenants) ? reqRow.id_tenants[0] : reqRow.id_tenants;
  if (!tenant || !isTenantSubscriptionActive(tenant)) {
    return NextResponse.json({ error: 'Portal temporarily unavailable' }, { status: 402 });
  }

  const { data: itemRow } = await supabaseAdmin
    .from('id_request_items')
    .select('id')
    .eq('id', requestItemId)
    .eq('request_id', reqRow.id)
    .maybeSingle();

  if (!itemRow) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  try {
    const upload = await createQuarantineUploadUrl({
      tenantId: reqRow.tenant_id,
      requestId: reqRow.id,
      requestItemId,
      mimeType,
    });
    return NextResponse.json(upload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload initialization failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
