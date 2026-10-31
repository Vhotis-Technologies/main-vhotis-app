import { Seller } from '@/app/interfaces/main/Authentication';

export function allowsPublicStorefrontUrl(
  seller: Seller | null | undefined,
): boolean {
  if (!seller) return false;
  if (seller.allows_public_storefront_url != null) {
    return Boolean(seller.allows_public_storefront_url);
  }
  return (
    seller.subscription_tier_code === 'enterprise_plus' &&
    Boolean(seller.has_active_subscription)
  );
}
