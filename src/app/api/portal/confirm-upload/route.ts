import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hashIpAddress, hashPortalToken, sanitizeFilename } from '@/lib/security/tokens';
import { isTenantSubscriptionActive } from '@/lib/billing/subscription-guard';
import { ConfirmUploadSchema } from '@/schemas/intake.schema';
import { inspectAndPromoteFromQuarantine } from '@/services/storage/vault.service';
import { validateDocumentWithAI } from '@/services/ai/document-validator.service';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = ConfirmUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid upload confirmation' }, { status: 400 });
  }

  const { portalToken, requestItemId, quarantinePath, originalFilename, allowManualOverride } = parsed.data;
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

  const expectedPrefix = `tenants/${reqRow.tenant_id}/requests/${reqRow.id}/items/${requestItemId}/`;
  if (!quarantinePath.startsWith(expectedPrefix)) {
    return NextResponse.json({ error: 'Invalid quarantine object path' }, { status: 403 });
  }

  const { data: itemRow } = await supabaseAdmin
    .from('id_request_items')
    .select('id, title, expected_doc_type, require_expiry_check')
    .eq('id', requestItemId)
    .eq('request_id', reqRow.id)
    .maybeSingle();

  if (!itemRow) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 });
  }

  let promoted;
  try {
    promoted = await inspectAndPromoteFromQuarantine({
      quarantinePath,
      tenantId: reqRow.tenant_id,
      requestId: reqRow.id,
      requestItemId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'File validation failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const aiOutcome = await validateDocumentWithAI({
    buffer: promoted.buffer,
    mimeType: promoted.detectedMime,
    itemTitle: itemRow.title,
    expectedDocType: itemRow.expected_doc_type,
    requireExpiryCheck: itemRow.require_expiry_check,
  });

  // Mark previous submissions for this item as non-current
  await supabaseAdmin
    .from('id_document_submissions')
    .update({ is_current: false })
    .eq('request_item_id', requestItemId)
    .eq('is_current', true);

  const itemStatus =
    aiOutcome.status === 'passed'
      ? 'ai_approved'
      : allowManualOverride
        ? 'ai_flagged'
        : 'ai_flagged';

  const { data: submission, error: subErr } = await supabaseAdmin
    .from('id_document_submissions')
    .insert({
      request_item_id: requestItemId,
      request_id: reqRow.id,
      tenant_id: reqRow.tenant_id,
      storage_bucket: 'id-vault',
      storage_path: promoted.vaultPath,
      original_filename_sanitized: sanitizeFilename(originalFilename),
      mime_type: promoted.detectedMime,
      file_size_bytes: promoted.fileSizeBytes,
      sha256_checksum: promoted.sha256Checksum,
      uploaded_by_type: 'client_portal',
      is_current: true,
      ai_status: aiOutcome.status,
      ai_confidence: aiOutcome.validation?.matchConfidence ?? null,
      ai_detected_doc_type: aiOutcome.validation?.detectedDocType ?? null,
      ai_is_legible: aiOutcome.validation?.isLegible ?? null,
      ai_extracted_expiry_date: aiOutcome.validation?.extractedExpiryDate ?? null,
      ai_is_expired: aiOutcome.isExpired,
      ai_flags: aiOutcome.validation?.issues ?? [],
      ai_client_feedback: aiOutcome.validation?.clientFeedbackShort ?? null,
      ai_model_used: aiOutcome.modelUsed,
      ai_processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (subErr || !submission) {
    return NextResponse.json({ error: 'Failed to record submission' }, { status: 500 });
  }

  await supabaseAdmin
    .from('id_request_items')
    .update({ status: itemStatus })
    .eq('id', requestItemId);

  await supabaseAdmin
    .from('id_client_requests')
    .update({
      status: 'in_progress',
      last_client_activity_at: new Date().toISOString(),
    })
    .eq('id', reqRow.id);

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await supabaseAdmin.from('id_document_audit_logs').insert({
    tenant_id: reqRow.tenant_id,
    actor_type: 'magic_link_guest',
    actor_id: reqRow.id,
    action: 'UPLOAD',
    resource_id: submission.id,
    file_sha256: promoted.sha256Checksum,
    ip_hash: hashIpAddress(ip),
  });

  return NextResponse.json({
    ok: true,
    itemStatus,
    aiStatus: aiOutcome.status,
    feedback:
      aiOutcome.validation?.clientFeedbackShort ??
      'Document uploaded and queued for review.',
    isExpired: aiOutcome.isExpired,
  });
}
