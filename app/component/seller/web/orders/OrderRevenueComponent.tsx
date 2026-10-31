import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "@/app/_utils/main/helpers";


interface OrderRevenueProps {
  amount: number;
  currency: string;
  percentageChange?: number;
}

const OrderRevenueComponent = ({
  amount,
  currency,
  percentageChange,
}: OrderRevenueProps) => {

  const cardColor = useThemeColor({}, "cards");
  const tintColor = useThemeColor({}, "tint");  

  return (
    <LinearGradient style={styles.mainContainer}
    colors={[tintColor, cardColor]}
    start={{x: 2, y: 8}}
    end={{x: 1, y: 0}}
    >
      <View style={styles.contentContainer}>
        <View>
          <StyledText variant="labelLarge" children="Order Revenue" />
          <StyledText variant="labelMedium" children="All time" />
        </View>

        <View style={styles.amountContainer}>
          <StyledText variant="titleMedium" children={formatCurrency(amount)} />
        </View>

        {percentageChange !== undefined && (
          <View style={styles.changeContainer}>
            <MaterialCommunityIcons
              name={percentageChange >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={percentageChange >= 0 ? "#48BB78" : "#F56565"}
            />
            <StyledText
              style={[
                styles.changeText,
                { color: percentageChange >= 0 ? "#48BB78" : "#F56565" },
              ]}
            >
              {Math.abs(percentageChange)}% from last period
            </StyledText>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default OrderRevenueComponent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
  },
  contentContainer: {
    padding: 16,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    fontFamily: "BarlowRegular",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: "#718096",
    fontFamily: "BarlowRegular",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3748",
    marginRight: 4,
    fontFamily: "RobotoBold",
  },
  amountText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    fontFamily: "RobotoBold",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontFamily: "BarlowRegular",
  },
});
