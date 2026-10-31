import { MaterialIcons } from "@expo/vector-icons";

export type MembershipBenefitItem = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
};

export const MEMBER_ORDER_FREE_DELIVERY_THRESHOLD = 50;

export const MEMBERSHIP_BENEFITS: MembershipBenefitItem[] = [
  {
    id: "free-delivery",
    icon: "local-shipping",
    title: "1 free delivery",
    description: "Your first delivery each month is completely free.",
  },
  {
    id: "priority",
    icon: "bolt",
    title: "Priority delivery",
    description: "Every order gets priority handling at no extra charge.",
  },
  {
    id: "free-over-50",
    icon: "sell",
    title: "Free delivery on big orders",
    description:
      "On orders over €50 after your monthly free delivery is used.",
  },
];
