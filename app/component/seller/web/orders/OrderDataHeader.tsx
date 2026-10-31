import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const OrderDataHeader = () => {
  const textColor = useThemeColor({ dark: "#2D3748", light: "#4A5568" }, "text");
  const tintColor = useThemeColor({ dark: "#4A5568", light: "#2D3748" }, "tint");
  return (
    <View>
      <StyledText style={styles.headerText} children="All Orders" />
      <LinearGradient
        style={styles.section}
        colors={[tintColor, textColor]}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 2 }}
      >
        <StyledText
          style={[styles.sectionText, { flex: 1 }]}
          children="order id"
        />
        <StyledText
          style={[styles.sectionText, { flex: 1.5 }]}
          children="date"
        />
        <StyledText
          style={[styles.sectionText, { flex: 1.5 }]}
          children="customer"
        />
        <StyledText
          style={[styles.sectionText, { flex: 1.5 }]}
          children="status"
        />
        <StyledText
          style={[styles.sectionText, { flex: 1.5 }]}
          children="payment"
        />
        <StyledText
          style={[styles.sectionText, { flex: 1 }]}
          children="price"
        />
      </LinearGradient>
    </View>
  );
};

export default OrderDataHeader;

const styles = StyleSheet.create({
  mainContainer: {
    padding: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "RobotoRegular",
    padding: 16,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    padding: 12,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "RobotoRegular",
    color: "white",
    textTransform: "capitalize",
  },
});
