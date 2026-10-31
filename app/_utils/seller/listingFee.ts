/** Per-unit listing fee on Starter (EUR). */
export const LISTING_FEE_PER_UNIT_EUR = 0.2;

export type ListingFeeBreakdown = {
  calculated: number;
  charged: number;
};

export function getListingFeeBreakdown(
  unitFee: number,
  quantity: number,
): ListingFeeBreakdown {
  const qty = Math.max(1, Math.floor(quantity) || 1);
  const calculated = Math.round(unitFee * qty * 100) / 100;
  return {
    calculated,
    charged: calculated,
  };
}
