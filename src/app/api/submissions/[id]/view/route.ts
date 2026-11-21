import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createVaultViewUrl } from '@/services/storage/vault.service';
import { hashIpAddress } from '@/lib/security/tokens';

export async function GET(
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

  // RLS ensures user can only read submissions belonging to their tenant
  const { data: sub } = await supabase
    .from('id_document_submissions')
    .select('id, tenant_id, storage_path, original_filename_sanitized, sha256_checksum')
    .eq('id', id)
    .maybeSingle();

  if (!sub) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  try {
    const signedUrl = await createVaultViewUrl(sub.storage_path, sub.original_filename_sanitized);
    const supabaseAdmin = createSupabaseAdminClient();
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    await supabaseAdmin.from('id_document_audit_logs').insert({
      tenant_id: sub.tenant_id,
      actor_type: 'staff',
      actor_id: user.id,
      action: 'SIGNED_URL_VIEW',
      resource_id: sub.id,
      file_sha256: sub.sha256_checksum,
      ip_hash: hashIpAddress(ip),
    });

    return NextResponse.json({ signedUrl });
  } catch {
    return NextResponse.json({ error: 'Unable to generate download URL' }, { status: 500 });
  }
}
