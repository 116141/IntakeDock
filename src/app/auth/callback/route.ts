import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSuperAdminEmail } from '@/lib/auth/super-admin';

function sanitizeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/overview';
  }
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextPath = sanitizeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  if (isSuperAdminEmail(user.email)) {
    return NextResponse.redirect(`${origin}/admin`);
  }

  const supabaseAdmin = createSupabaseAdminClient();

  // Auto-activate pending staff invitations matching email
  if (user.email) {
    await supabaseAdmin
      .from('id_tenant_memberships')
      .update({ user_id: user.id, status: 'active' })
      .eq('email', user.email.toLowerCase())
      .eq('status', 'invited');
  }

  const { data: owned } = await supabaseAdmin
    .from('id_tenants')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (owned && owned.length > 0) {
    return NextResponse.redirect(`${origin}${nextPath}`);
  }

  const { data: member } = await supabaseAdmin
    .from('id_tenant_memberships')
    .select('tenant_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1);

  if (member && member.length > 0) {
    return NextResponse.redirect(`${origin}${nextPath}`);
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}
