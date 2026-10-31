import StyledText from "@/app/component/helpers/forms/StyledText";
import { OrderItemInterface } from "@/app/interfaces/seller/orders/OrdersInterface";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


interface OrderItemProps {
  item: OrderItemInterface;
  onPress?: (id: string) => void;
}

const OrderItem = ({
  item,
  onPress,
}: OrderItemProps) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  /* Display the color of the status given the status
   * If the status is "pending" then the color is "yellow"
   * If the status is "completed" then the color is "green"
   * If the status is "cancelled" then the color is "red"
   */
  const getStatusColor = (status?: string, payment_status?: string) => {
    if (payment_status) {
      switch (payment_status) {
        case "cancelled":
          return "red";
        case "paid":
          return "green";
        case "unpaid":
          return "yellow";
        default:
          return "gray";
      }
    } else if (status) {
      switch (status) {
        case "pending":
          return "green";
        case "completed":
          return "green";
        case "cancelled":
          return "red";
        default:
          return "gray";
      }
    }
  };

  return (
    <TouchableOpacity style={styles.maincontainer} onPress={() => onPress && onPress(item.id)}>
      <StyledText style={[styles.itemText, { flex: 1 }]} numberOfLines={1} variant="labelMedium" children={item.id} />
      <StyledText style={[styles.itemText, { flex: 1.5 }]} numberOfLines={1} variant="labelMedium" children={item.date.toLocaleString()} />
      <StyledText style={[styles.itemText, { flex: 1.5 }]} numberOfLines={1} variant="labelMedium" children={item.customer_name} />

      <StyledText style={[styles.statusText, { flex: 1.5 }]} variant="labelMedium" children={item.status} />
      <StyledText
        style={[
          styles.statusText,
          {
            color: getStatusColor(undefined, item.payment_status),
            backgroundColor: "rgba(168, 91, 91, 0.1)",
            textAlign: "center",
            flex: 1.5,
          },
        ]}
      >
        {item.payment_status}
      </StyledText>
      <StyledText style={[styles.itemText, { flex: 1 }]} numberOfLines={1} variant="labelMedium" children={item.price} />
    </TouchableOpacity>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(168, 91, 91, 0.1)",
    gap: 10,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 14,
    fontFamily: "RobotoRegular",
    color: "#4A5568",
  },
  centerAlign: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "RobotoRegular",
    padding: 5,
    borderRadius: 5,
    textTransform: "capitalize",
  },
  actionButtonContainer: {
    position: "absolute",
    left: 40,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 2,
    backgroundColor: "white",
    ...Platform.select({
      web: {
        boxShadow: "3px 3px 3px 3px rgba(0, 0, 0, 0.1)",
        minWidth: 200,
      },
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        minWidth: 100,
      },
      android: {
        minWidth: 100,
        elevation: 3,
      },
    }),
  },
});
