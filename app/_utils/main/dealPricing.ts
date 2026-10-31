import { formatCurrency, formatDealBadge } from "@/app/_utils/main/helpers";
import { DealInfo } from "@/app/interfaces/main/deals/deals";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";

export type DealPricingSource = Partial<ProductCardInterface> & {
  deal?: DealInfo | null;
  bogo_bundle_size?: number;
  bogo_bundle_paid_total?: number;
  bogo_bundle_items_total?: number;
};

export function isBogoDealType(dealType?: string | null): boolean {
  return dealType === "bogo";
}

export function resolveDealFromItem(item: DealPricingSource): DealInfo | null {
  if (item.deal?.deal_type) {
    return item.deal;
  }
  if (item.deal_type) {
    return {
      deal_type: item.deal_type,
      bogo_buy_quantity: item.bogo_buy_quantity,
      bogo_get_quantity: item.bogo_get_quantity,
      discount_percentage: item.discount_percentage,
      discount_amount: item.discount_amount,
      discount_value: item.discount_value,
      bundle_price: item.bundle_price,
    } as DealInfo;
  }
  return null;
}

export function getBogoQuantities(deal: DealInfo | null | undefined) {
  return {
    buy: deal?.bogo_buy_quantity ?? 1,
    get: deal?.bogo_get_quantity ?? 1,
  };
}

export function getBundleSize(buy: number, get: number) {
  return buy + get;
}

export function formatBogoBundleSubtext(
  buy: number,
  get: number,
  unitPrice: number,
  country?: string
) {
  const bundleSize = getBundleSize(buy, get);
  const paidTotal = buy * unitPrice;
  return `${formatCurrency(paidTotal, country)} for ${bundleSize} items (pay for ${buy}, ${get} free)`;
}

export function formatBogoCartSummary(
  quantity: number,
  quantityPaid: number,
  quantityFree: number,
  buy: number,
  get: number
) {
  if (quantityFree > 0) {
    return `Pay for ${quantityPaid}, get ${quantityFree} free (${quantity} items)`;
  }

  const bundleSize = getBundleSize(buy, get);
  const remainder = quantity % bundleSize;
  const needed = remainder === 0 ? bundleSize : bundleSize - remainder;

  if (quantity < buy) {
    return `Add ${buy - quantity} more to start this deal (Buy ${buy} Get ${get})`;
  }

  return `Add ${needed} more to unlock ${get} free item${get === 1 ? "" : "s"}`;
}

export type ProductPriceDisplay = {
  unitPrice: number;
  showStrikethrough: boolean;
  strikethroughPrice?: number;
  salePrice?: number;
  dealSubtext?: string;
  isBogo: boolean;
  dealBadge: string | null;
  bogoBundleSize?: number;
};

function parsePrice(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const parsed = parseFloat(String(value ?? 0));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function resolveProductPriceDisplay(
  item: DealPricingSource,
  country?: string
): ProductPriceDisplay {
  const deal = resolveDealFromItem(item);
  const dealType = deal?.deal_type ?? item.deal_type;
  const unitPrice = parsePrice(item.price ?? item.selling_price);
  const dealBadge = dealType
    ? formatDealBadge(dealType, {
        discount_percentage: deal?.discount_percentage ?? item.discount_percentage,
        discount_amount: deal?.discount_amount ?? item.discount_amount,
        bogo_buy_quantity: deal?.bogo_buy_quantity ?? item.bogo_buy_quantity,
        bogo_get_quantity: deal?.bogo_get_quantity ?? item.bogo_get_quantity,
        bundle_price: deal?.bundle_price ?? item.bundle_price,
        discount_value: item.discount_value,
      })
    : null;

  if (isBogoDealType(dealType)) {
    const { buy, get } = getBogoQuantities(deal);
    const bundleSize =
      item.bogo_bundle_size ?? item.bogo_bundle_items_total ?? getBundleSize(buy, get);

    return {
      unitPrice,
      showStrikethrough: false,
      salePrice: unitPrice,
      isBogo: true,
      dealBadge,
      dealSubtext: formatBogoBundleSubtext(buy, get, unitPrice, country),
      bogoBundleSize: bundleSize,
    };
  }

  const discountedPrice = parsePrice(item.discounted_price);
  const showStrikethrough =
    discountedPrice > 0 && unitPrice > 0 && discountedPrice < unitPrice;

  return {
    unitPrice,
    showStrikethrough,
    strikethroughPrice: showStrikethrough ? unitPrice : undefined,
    salePrice: showStrikethrough ? discountedPrice : unitPrice,
    isBogo: false,
    dealBadge,
  };
}
