import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  OrderStatus,
  OrderAction,
} from "@/app/interfaces/seller/orders/OrdersInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";

interface UpdateOrderStatusModalProps {
  onSelectStatus: (action: OrderAction) => void;
  onClose: () => void;
  currentStatus?: string;
}

const UpdateOrderStatusModal = ({
  onSelectStatus,
  onClose,
  currentStatus,
}: UpdateOrderStatusModalProps) => {
  const secondaryColor = useThemeColor({}, "secondaryButton");
  const errorColor = useThemeColor({}, "error") || "#EF4444";
  const successColor = useThemeColor({}, "success") || "#10B981";

  const handleActionSelection = (action: OrderAction) => {
    onSelectStatus(action);
    onClose();
  };

  // Get available actions based on current status
  const getAvailableActions = (
    status?: string,
  ): Array<{
    action: OrderAction;
    label: string;
    icon: string;
    color: string;
  }> => {
    switch (status) {
      case "pending":
        return [
          {
            action: "claimed",
            label: "Claim Order",
            icon: "check-circle",
            color: successColor,
          },
          {
            action: "rejected",
            label: "Reject Order",
            icon: "close-circle",
            color: errorColor,
          },
        ];
      case "claimed":
        return [
          {
            action: "packed",
            label: "Mark as Packed",
            icon: "package-variant",
            color: successColor,
          },
        ];
      case "packed":
        return [
          {
            action: "shipped",
            label: "Mark as Shipped",
            icon: "truck-delivery",
            color: successColor,
          },
        ];
      default:
        return [
          {
            action: "claimed",
            label: "Claim Order",
            icon: "check-circle",
            color: successColor,
          },
          {
            action: "rejected",
            label: "Reject Order",
            icon: "close-circle",
            color: errorColor,
          },
        ];
    }
  };

  const availableActions = getAvailableActions(currentStatus);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardColor = useThemeColor({}, "cards");

  return (
    <View style={[styles.statusContainer, { backgroundColor: cardColor }]}>
      <View style={styles.statusModalHeader}>
        <StyledText variant="titleMedium" children="Update Order Status" />
        <Pressable onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color={textColor} />
        </Pressable>
      </View>
      <View style={styles.statusButtonsContainer}>
        {availableActions.map((actionItem, index) => (
          <Pressable
            key={index}
            onPress={() => handleActionSelection(actionItem.action)}
            style={[styles.statusButton, { backgroundColor: actionItem.color }]}
          >
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name={actionItem.icon as any}
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <StyledText
                variant="labelLarge"
                children={actionItem.label}
                style={styles.buttonText}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default UpdateOrderStatusModal;

const styles = StyleSheet.create({
  statusContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  statusModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statusButtonsContainer: {
    padding: 16,
    gap: 12,
  },
  statusButtonContainer: {
    borderRadius: 8,
    alignItems: "center",
  },
  statusButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius:20,
    minHeight: 44,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
