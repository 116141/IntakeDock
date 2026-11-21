import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';

const PaddleWebhookSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  data: z.object({
    id: z.string().optional(),
    customer_id: z.string().optional(),
    currency_code: z.enum(['USD', 'EUR']).optional(),
    custom_data: z
      .object({
        tenant_id: z.string().uuid().optional(),
        plan_tier: z.enum(['starter', 'studio']).optional(),
      })
      .passthrough()
      .optional(),
  }).passthrough(),
});

export function verifyPaddleSignatureOrThrow(rawBody: string, signatureHeader: string | null): void {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('PADDLE_WEBHOOK_SECRET is not configured');
  }
  if (!signatureHeader) {
    throw new Error('Missing Paddle-Signature header');
  }

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(';')) {
    const idx = segment.indexOf('=');
    if (idx > 0) {
      parts[segment.slice(0, idx).trim()] = segment.slice(idx + 1).trim();
    }
  }

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) {
    throw new Error('Malformed Paddle-Signature header');
  }

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Math.floor(Date.now() / 1000) - tsNum) > 300) {
    throw new Error('Webhook timestamp outside 5-minute tolerance');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`, 'utf8')
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(h1, 'hex');
  if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    throw new Error('Invalid Paddle webhook signature');
  }
}

export function parseVerifiedPaddleWebhook(rawBody: string) {
  const parsed = PaddleWebhookSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    throw new Error('Invalid Paddle webhook payload');
  }
  return parsed.data;
}
