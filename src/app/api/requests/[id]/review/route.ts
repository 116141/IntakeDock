import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ReviewItemSchema } from '@/schemas/intake.schema';
import { hashIpAddress } from '@/lib/security/tokens';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

  const parsed = ReviewItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid review decision' }, { status: 400 });
  }

  // RLS validates membership on id_client_requests
  const { data: reqRow } = await supabase
    .from('id_client_requests')
    .select('id, tenant_id')
    .eq('id', id)
    .maybeSingle();

  if (!reqRow) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { requestItemId, decision, rejectionReason } = parsed.data;

  await supabaseAdmin
    .from('id_request_items')
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? (rejectionReason ?? 'Needs clearer document') : null,
    })
    .eq('id', requestItemId)
    .eq('request_id', reqRow.id);

  // Check if all required items are approved
  const { data: allItems } = await supabaseAdmin
    .from('id_request_items')
    .select('status, is_required')
    .eq('request_id', reqRow.id);

  const allRequiredApproved = (allItems ?? [])
    .filter((i) => i.is_required)
    .every((i) => i.status === 'human_approved' || i.status === 'ai_approved');

  if (allRequiredApproved && (allItems?.length ?? 0) > 0) {
    await supabaseAdmin
      .from('id_client_requests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', reqRow.id);
  }

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await supabaseAdmin.from('id_document_audit_logs').insert({
    tenant_id: reqRow.tenant_id,
    actor_type: 'staff',
    actor_id: user.id,
    action: decision === 'human_approved' ? 'HUMAN_APPROVE' : 'HUMAN_REJECT',
    resource_id: requestItemId,
    ip_hash: hashIpAddress(ip),
  });

  return NextResponse.json({ ok: true, status: decision, completed: allRequiredApproved });
}
