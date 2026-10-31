export type DealType = "percentage" | "fixed" | "bogo" | "bundle";

export default interface PromotionInterfaceState {
  promotion_type: "store" | "product";
  selected_product: { id: string; name: string }[];
  deal_type: DealType;
}


