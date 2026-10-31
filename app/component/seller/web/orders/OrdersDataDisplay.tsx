import { OrdersDataInterface } from "@/app/interfaces/seller/orders/OrdersInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const TimeframeOverlay = ({
  onPress,
  visible,
}: {
  onPress: (value: string) => void;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      {["All time", "Weekly", "Monthly", "Yearly"].map((timeframe) => (
        <Pressable
          key={timeframe}
          style={styles.timeframeButton}
          onPress={() => onPress(timeframe)}
        >
          <StyledText variant="labelLarge" children={timeframe} />
        </Pressable>
      ))}
    </View>
  );
};

const OrdersDataDisplay = ({
  title,
  amount,
  fufilment_rate,
  onPress,
}: OrdersDataInterface) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("All time");

  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const handleTimeframeSelect = (value: string) => {
    setSelectedTimeframe(value);
    setIsOverlayVisible(false);
  };

  const displayValue = fufilment_rate
    ? `${(fufilment_rate * 100).toFixed(1)}%`
    : amount?.toLocaleString();

  return (
    <LinearGradient style={styles.mainContainer}
    colors={[tintColor, cardColor]}
    start={{x: 2, y: 8}}
    end={{x: 1, y: 0}}
    >
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.headerContainer}>
          <StyledText variant="labelLarge" children={title} />
          <Pressable
            hitSlop={10}
            style={styles.iconButton}
            onPress={() => setIsOverlayVisible(!isOverlayVisible)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={18}
              color="#4A5568"
            />
          </Pressable>
        </View>

        <StyledText variant="titleMedium" children={displayValue} />
        <StyledText variant="labelMedium" children={selectedTimeframe} />
      </TouchableOpacity>

      <TimeframeOverlay
        visible={isOverlayVisible}
        onPress={handleTimeframeSelect}
      />
    </LinearGradient>
  );
};

export default OrdersDataDisplay;

const styles = StyleSheet.create({
  mainContainer: {
    flex:1,
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "3px 3px 3px 3px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  contentContainer: {
    padding: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap:5
  },
  iconButton: {
    padding: 4,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 3000,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    minWidth: 80,
  },
  timeframeButton: {
    gap:5
  },
});
