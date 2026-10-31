import { Seller } from '@/app/interfaces/main/Authentication';
import type { FulfillmentEnrollmentStatus } from '@/app/interfaces/seller/FulfillmentInterface';

const ENTERPRISE_TIER_CODES = new Set(['enterprise', 'enterprise_plus']);

/** True when the seller is on the free Starter subscription tier. */
export function isStarterSubscriber(seller: Seller | null | undefined): boolean {
  if (!seller) return true;
  const code = seller.subscription_tier_code?.trim().toLowerCase();
  if (code) {
    return code === 'starter';
  }
  return seller.subscription_plan?.toLowerCase().includes('starter') ?? false;
}

/**
 * Enterprise / Enterprise Plus may apply for warehouse fulfillment.
 * Prefers the server entitlement when present; otherwise infers from tier code.
 */
export function canApplyForFulfillment(seller: Seller | null | undefined): boolean {
  if (!seller) return false;
  if (seller.allows_fulfillment != null) {
    return Boolean(seller.allows_fulfillment);
  }
  const code = seller.subscription_tier_code?.trim().toLowerCase() ?? '';
  if (ENTERPRISE_TIER_CODES.has(code)) {
    return true;
  }
  const plan = seller.subscription_plan?.toLowerCase() ?? '';
  return plan.includes('enterprise');
}

export function showFulfillmentInNav(status: FulfillmentEnrollmentStatus): boolean {
  return status === 'active' || status === 'pending';
}
