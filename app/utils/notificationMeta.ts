import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export type NotificationMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
};

export type SellerNotificationMeta = {
  icon: keyof typeof MaterialIcons.glyphMap;
  accent: string;
};

const DEFAULT_ACCENT = "#2563EB";

type NotificationCategory =
  | "order"
  | "payment"
  | "promotion"
  | "review"
  | "cart"
  | "alert"
  | "cancel"
  | "default";

function getNotificationCategory(title: string): NotificationCategory {
  const lower = title.toLowerCase();

  if (
    lower.includes("order") ||
    lower.includes("shipped") ||
    lower.includes("delivery") ||
    lower.includes("rider") ||
    lower.includes("delivered")
  ) {
    return "order";
  }
  if (lower.includes("payment") || lower.includes("refund")) {
    return "payment";
  }
  if (
    lower.includes("sale") ||
    lower.includes("discount") ||
    lower.includes("offer") ||
    lower.includes("promotion") ||
    lower.includes("deal")
  ) {
    return "promotion";
  }
  if (lower.includes("review") || lower.includes("rating")) {
    return "review";
  }
  if (lower.includes("cart") || lower.includes("checkout")) {
    return "cart";
  }
  if (
    lower.includes("stock") ||
    lower.includes("inventory") ||
    lower.includes("alert") ||
    lower.includes("unavailable")
  ) {
    return "alert";
  }
  if (lower.includes("cancel")) {
    return "cancel";
  }

  return "default";
}

const IONICON_BY_CATEGORY: Record<
  NotificationCategory,
  keyof typeof Ionicons.glyphMap
> = {
  order: "cube-outline",
  payment: "card-outline",
  promotion: "pricetag-outline",
  review: "star-outline",
  cart: "basket-outline",
  alert: "warning-outline",
  cancel: "close-circle-outline",
  default: "notifications-outline",
};

const MATERIAL_ICON_BY_CATEGORY: Record<
  NotificationCategory,
  keyof typeof MaterialIcons.glyphMap
> = {
  order: "local-shipping",
  payment: "payments",
  promotion: "local-offer",
  review: "star-outline",
  cart: "shopping-cart",
  alert: "warning-amber",
  cancel: "cancel",
  default: "notifications-none",
};

const ACCENT_BY_CATEGORY: Record<NotificationCategory, string> = {
  order: "#059669",
  payment: "#2563EB",
  promotion: "#7C3AED",
  review: "#D97706",
  cart: "#0891B2",
  alert: "#DC2626",
  cancel: "#DC2626",
  default: DEFAULT_ACCENT,
};

export function getNotificationMeta(title: string): NotificationMeta {
  const category = getNotificationCategory(title);
  return {
    icon: IONICON_BY_CATEGORY[category],
    accent: ACCENT_BY_CATEGORY[category],
  };
}

export function getSellerNotificationMeta(title: string): SellerNotificationMeta {
  const category = getNotificationCategory(title);
  return {
    icon: MATERIAL_ICON_BY_CATEGORY[category],
    accent: ACCENT_BY_CATEGORY[category],
  };
}
