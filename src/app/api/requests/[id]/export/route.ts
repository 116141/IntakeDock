import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateRequestBundle } from '@/services/export/bundle-exporter.service';
import { hashIpAddress } from '@/lib/security/tokens';

const ExportBodySchema = z.object({
  format: z.enum(['zip', 'pdf']).default('zip'),
}).strict();

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

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const parsed = ExportBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
  }

  const { data: reqRow } = await supabase
    .from('id_client_requests')
    .select('id, tenant_id, title, client_name, client_email, id_tenants(name)')
    .eq('id', id)
    .maybeSingle();

  if (!reqRow) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const { data: items } = await supabase
    .from('id_request_items')
    .select('id, title, status, sort_order')
    .eq('request_id', reqRow.id)
    .order('sort_order', { ascending: true });

  const { data: submissions } = await supabase
    .from('id_document_submissions')
    .select('request_item_id, storage_path, mime_type, sha256_checksum, original_filename_sanitized, created_at')
    .eq('request_id', reqRow.id)
    .eq('is_current', true);

  const subByItem = new Map(
    (submissions ?? []).map((s) => [s.request_item_id, s])
  );

  const tenantObj = Array.isArray(reqRow.id_tenants) ? reqRow.id_tenants[0] : reqRow.id_tenants;
  try {
    const result = await generateRequestBundle({
      tenantId: reqRow.tenant_id,
      tenantName: tenantObj?.name ?? 'IntakeDock Workspace',
      requestId: reqRow.id,
      requestTitle: reqRow.title,
      clientName: reqRow.client_name,
      clientEmail: reqRow.client_email,
      format: parsed.data.format,
      createdByUserId: user.id,
      items: (items ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        submission: subByItem.get(item.id) ?? null,
      })),
    });

    const supabaseAdmin = createSupabaseAdminClient();
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    await supabaseAdmin.from('id_document_audit_logs').insert({
      tenant_id: reqRow.tenant_id,
      actor_type: 'staff',
      actor_id: user.id,
      action: parsed.data.format === 'zip' ? 'ZIP_EXPORT' : 'PDF_EXPORT',
      resource_id: reqRow.id,
      ip_hash: hashIpAddress(ip),
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
