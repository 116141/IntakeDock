export interface TenantSubscriptionRecord {
  subscription_status: string;
  trial_ends_at: string;
}

export function isTenantSubscriptionActive(tenant: TenantSubscriptionRecord): boolean {
  if (tenant.subscription_status === 'active' || tenant.subscription_status === 'vip') {
    return true;
  }
  if (tenant.subscription_status === 'trial') {
    const trialEnd = new Date(tenant.trial_ends_at).getTime();
    return Number.isFinite(trialEnd) && trialEnd > Date.now();
  }
  return false;
}
