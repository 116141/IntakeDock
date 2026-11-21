import 'server-only';
import crypto from 'node:crypto';

export function generatePortalToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  return { rawToken, tokenHash: hashPortalToken(rawToken) };
}

export function hashPortalToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function hashIpAddress(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'document';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  return cleaned.slice(0, 120) || 'document';
}
