import { Seller } from '@/app/interfaces/main/Authentication';

/** Lite and above — Starter cannot share public product web links. */
export function allowsProductShare(
  seller: Seller | null | undefined,
): boolean {
  if (!seller) return false;
  if (seller.allows_product_share != null) {
    return Boolean(seller.allows_product_share);
  }
  const code = seller.subscription_tier_code?.trim().toLowerCase();
  if (code) {
    return code !== 'starter';
  }
  return !seller.subscription_plan?.toLowerCase().includes('starter');
}
