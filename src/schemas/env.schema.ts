import { z } from 'zod';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const PublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_PAYMENT_PROVIDER: z.enum(['paddle', 'dodo']).default('paddle'),
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().optional(),
  NEXT_PUBLIC_PADDLE_STARTER_USD: z.string().optional(),
  NEXT_PUBLIC_PADDLE_STARTER_EUR: z.string().optional(),
  NEXT_PUBLIC_PADDLE_STUDIO_USD: z.string().optional(),
  NEXT_PUBLIC_PADDLE_STUDIO_EUR: z.string().optional(),
});

export const ServerEnvSchema = PublicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  GEMINI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  DODO_WEBHOOK_SECRET: z.string().optional(),
});

export function getPublicEnv() {
  return PublicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_PAYMENT_PROVIDER: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? 'paddle',
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    NEXT_PUBLIC_PADDLE_STARTER_USD: process.env.NEXT_PUBLIC_PADDLE_STARTER_USD,
    NEXT_PUBLIC_PADDLE_STARTER_EUR: process.env.NEXT_PUBLIC_PADDLE_STARTER_EUR,
    NEXT_PUBLIC_PADDLE_STUDIO_USD: process.env.NEXT_PUBLIC_PADDLE_STUDIO_USD,
    NEXT_PUBLIC_PADDLE_STUDIO_EUR: process.env.NEXT_PUBLIC_PADDLE_STUDIO_EUR,
  });
}
