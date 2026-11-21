import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { CreateRequestSchema } from '@/schemas/intake.schema';
import { generatePortalToken } from '@/lib/security/tokens';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request payload' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tenant } = await supabaseAdmin
    .from('id_tenants')
    .select('id, subscription_status, trial_ends_at')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  if (!isTenantSubscriptionActive(tenant)) {
    return NextResponse.json(
      { error: 'Subscription or trial expired. Please upgrade in Billing.' },
      { status: 402 }
    );
  }

  const { rawToken, tokenHash } = generatePortalToken();
  const { clientName, clientEmail, clientPhoneE164, title, templateId, items } = parsed.data;

  const { data: reqRow, error: reqErr } = await supabaseAdmin
    .from('id_client_requests')
    .insert({
      tenant_id: tenant.id,
      template_id: templateId ?? null,
      created_by: user.id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone_e164: clientPhoneE164 || null,
      title,
      status: 'sent',
      portal_token_hash: tokenHash,
    })
    .select('id')
    .single();

  if (reqErr || !reqRow) {
    return NextResponse.json({ error: 'Failed to create client request' }, { status: 500 });
  }

  await supabaseAdmin.from('id_request_items').insert(
    items.map((item, idx) => ({
      request_id: reqRow.id,
      tenant_id: tenant.id,
      title: item.title,
      instructions_for_client: item.instructionsForClient,
      expected_doc_type: item.expectedDocType,
      is_required: item.isRequired,
      require_expiry_check: item.requireExpiryCheck,
      sort_order: idx,
    }))
  );

  return NextResponse.json({
    id: reqRow.id,
    portalPath: `/p/${rawToken}`,
  });
}
