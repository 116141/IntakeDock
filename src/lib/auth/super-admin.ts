import 'server-only';

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  const configured = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!configured || !email) return false;
  return email.trim().toLowerCase() === configured;
}
