import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { NotificationItemProps } from "../../../interfaces/seller/NotificationInterfaces";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkRead,
  onDelete,
  isSelected = false,
  style,
  ...props
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconsColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const bordersColor = useThemeColor({}, "borders");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_placed":
      case "order_confirmed":
      case "order_shipped":
      case "order_delivered":
      case "order_cancelled":
      case "order_returned":
        return { name: "shopping-cart", icon: MaterialIcons, color: "#4CAF50" };
      case "payment_received":
      case "payment_failed":
      case "payment_refunded":
        return { name: "payment", icon: MaterialIcons, color: "#2196F3" };
      case "inventory_low":
      case "inventory_out":
        return { name: "inventory", icon: MaterialIcons, color: "#FF9800" };
      case "product_review":
        return { name: "star", icon: MaterialIcons, color: "#9C27B0" };
      case "customer_support":
        return { name: "support-agent", icon: MaterialIcons, color: "#F44336" };
      case "promotion_created":
      case "promotion_expired":
        return { name: "local-offer", icon: MaterialIcons, color: "#E91E63" };
      case "system_maintenance":
        return { name: "build", icon: MaterialIcons, color: "#607D8B" };
      case "security_alert":
        return { name: "security", icon: MaterialIcons, color: "#FF5722" };
      case "account_verification":
        return { name: "verified-user", icon: MaterialIcons, color: "#4CAF50" };
      case "store_analytics":
        return { name: "analytics", icon: MaterialIcons, color: "#3F51B5" };
      case "competitor_alert":
        return { name: "trending-up", icon: MaterialIcons, color: "#FF9800" };
      default:
        return { name: "notifications", icon: Ionicons, color: buttonColor };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#2196F3";
      case "low":
        return "#4CAF50";
      default:
        return iconsColor;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const iconInfo = getNotificationIcon(notification.type);
  const IconComponent = iconInfo.icon;

  return <View></View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 5,
    borderRadius: 5,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedContainer: {
    opacity: 0.1,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  priorityIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  unreadBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NotificationItem;
