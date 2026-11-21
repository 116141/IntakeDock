import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { CreateTenantSchema } from '@/schemas/intake.schema';
import { INDUSTRY_PRESETS } from '@/services/templates/presets';

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

  const parsed = CreateTenantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { name, slug, contactEmail, defaultCurrency } = parsed.data;

  const { data: tenant, error: tenantErr } = await supabaseAdmin
    .from('id_tenants')
    .insert({
      owner_id: user.id,
      name,
      slug,
      contact_email: contactEmail,
      default_currency: defaultCurrency,
    })
    .select('id')
    .single();

  if (tenantErr || !tenant) {
    const msg =
      tenantErr?.code === '23505'
        ? 'This workspace URL slug is already taken.'
        : 'Could not create workspace.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  await supabaseAdmin.from('id_tenant_memberships').insert({
    tenant_id: tenant.id,
    user_id: user.id,
    email: (user.email ?? contactEmail).toLowerCase(),
    role: 'owner',
    status: 'active',
  });

  // Seed 4 industry checklist presets
  for (const preset of INDUSTRY_PRESETS) {
    const { data: tpl } = await supabaseAdmin
      .from('id_checklist_templates')
      .insert({
        tenant_id: tenant.id,
        name: preset.label,
        industry_preset: preset.id,
      })
      .select('id')
      .single();

    if (tpl) {
      await supabaseAdmin.from('id_template_items').insert(
        preset.items.map((item, idx) => ({
          template_id: tpl.id,
          tenant_id: tenant.id,
          title: item.title,
          instructions_for_client: item.instructionsForClient,
          expected_doc_type: item.expectedDocType,
          is_required: item.isRequired,
          require_expiry_check: item.requireExpiryCheck,
          sort_order: idx,
        }))
      );
    }
  }

  return NextResponse.json({ id: tenant.id });
}
