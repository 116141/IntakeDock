import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  parseVerifiedPaddleWebhook,
  verifyPaddleSignatureOrThrow,
} from '@/services/payments/webhook-verifier';

const STATUS_BY_EVENT: Record<string, string> = {
  'subscription.activated': 'active',
  'subscription.updated': 'active',
  'subscription.trialing': 'trial',
  'subscription.past_due': 'past_due',
  'subscription.paused': 'suspended',
  'subscription.canceled': 'canceled',
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get('Paddle-Signature');

  try {
    verifyPaddleSignatureOrThrow(rawBody, sigHeader);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event;
  try {
    event = parseVerifiedPaddleWebhook(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const tenantId = event.data.custom_data?.tenant_id ?? null;

  const { error: idempErr } = await supabaseAdmin.from('id_payment_webhook_events').insert({
    event_id: event.event_id,
    provider: 'paddle',
    event_type: event.event_type,
    tenant_id: tenantId,
    currency: event.data.currency_code ?? null,
  });

  if (idempErr) {
    if (idempErr.code === '23505') {
      return NextResponse.json({ received: true, idempotent: true });
    }
    return NextResponse.json({ error: 'Webhook persistence error' }, { status: 500 });
  }

  const nextStatus = STATUS_BY_EVENT[event.event_type];
  if (nextStatus && (tenantId || event.data.id)) {
    const updatePayload: Record<string, unknown> = {
      subscription_status: nextStatus,
      payment_provider: 'paddle',
    };
    if (event.data.customer_id) updatePayload.external_customer_id = event.data.customer_id;
    if (event.data.id) updatePayload.external_subscription_id = event.data.id;
    if (event.data.custom_data?.plan_tier) updatePayload.plan_tier = event.data.custom_data.plan_tier;
    if (event.data.currency_code) updatePayload.default_currency = event.data.currency_code;

    const query = supabaseAdmin.from('id_tenants').update(updatePayload);
    if (tenantId) {
      await query.eq('id', tenantId);
    } else if (event.data.id) {
      await query.eq('external_subscription_id', event.data.id);
    }
  }

  return NextResponse.json({ received: true });
}
