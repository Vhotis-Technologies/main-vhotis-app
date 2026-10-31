import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import OrderRatingComponent from "@/app/component/main/mobile/orders/OrderRatingComponent";

const OrderRatingScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Rate Order
        </StyledText>
      </View>
      <View style={styles.content}>
        <OrderRatingComponent orderId={id || ""} />
      </View>
    </View>
  );
};

export default OrderRatingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
