import React from "react";
import { StyleSheet, Text, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

const ProductHeaders = () => {
  const backgroundColor = useThemeColor({}, "background");
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StyledText style={[styles.text, styles.nameColumn]}>
        Product Description
      </StyledText>
      <StyledText style={[styles.text, styles.priceColumn]}>Price</StyledText>
      <StyledText style={[styles.text, styles.ratingColumn]}>Rating</StyledText>
      <StyledText style={[styles.text, styles.viewsColumn]}>Views</StyledText>
      <StyledText style={[styles.text, styles.statusColumn]}>Status</StyledText>
      <StyledText style={[styles.text, styles.quantityColumn]}>
        Quantity
      </StyledText>
      <View style={styles.actionsColumn}>
        <StyledText style={[styles.text, styles.actionText]}>
          Actions
        </StyledText>
      </View>
    </View>
  );
};

export default ProductHeaders;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minWidth: "100%",
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.5,
    color: "#666",
  },
  nameColumn: {
    flex: 3,
    minWidth: 200,
  },
  priceColumn: {
    flex: 1,
    minWidth: 80,
  },
  ratingColumn: {
    flex: 1,
    minWidth: 80,
  },
  viewsColumn: {
    flex: 1,
    minWidth: 80,
  },
  statusColumn: {
    flex: 1,
    minWidth: 80,
  },
  actionsColumn: {
    flex: 1,
    minWidth: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionText: {
    textAlign: "right",
  },
  quantityColumn: {
    flex: 1,
    minWidth: 80,
  },
});
