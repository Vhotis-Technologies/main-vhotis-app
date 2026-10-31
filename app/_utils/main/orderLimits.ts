import { formatCurrency } from "@/app/_utils/main/helpers";

export const MINIMUM_ORDER_AMOUNT = 20;

export type MinimumOrderStatus = {
  minimumAmount: number;
  meetsMinimum: boolean;
  shortfall: number;
};

export function resolveMinimumOrderStatus(
  subtotal: number,
  apiMinimum?: number
): MinimumOrderStatus {
  const minimumAmount = apiMinimum ?? MINIMUM_ORDER_AMOUNT;
  const shortfall = Math.max(0, minimumAmount - subtotal);

  return {
    minimumAmount,
    meetsMinimum: subtotal >= minimumAmount,
    shortfall,
  };
}

export function getMinimumOrderMessage(
  subtotal: number,
  country?: string,
  apiMinimum?: number
): string | null {
  const status = resolveMinimumOrderStatus(subtotal, apiMinimum);
  if (status.meetsMinimum) {
    return null;
  }

  return `Minimum order is ${formatCurrency(
    status.minimumAmount,
    country
  )}. Add ${formatCurrency(status.shortfall, country)} more to checkout.`;
}
