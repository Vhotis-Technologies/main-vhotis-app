import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import { FULFILLMENT_STATUS_LABELS } from "@/app/interfaces/seller/FulfillmentInterface";
import { canApplyForFulfillment } from "@/app/_utils/seller/fulfillmentAccess";

const FulfillmentStoreHubCard = () => {
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const { status } = useFulfillmentStatus();
  const canApply = canApplyForFulfillment(user);
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");

  if (!canApply && status === "none") {
    return (
      <Pressable
        onPress={() => router.push("/seller/main/store/SubscriptionScreen")}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: cardColor,
            borderColor,
            opacity: pressed ? 0.94 : 1,
          },
        ]}
      >
        <View style={styles.copy}>
          <StyledText variant="labelSmall" style={{ color: iconMuted }}>
            Recommended · Option 1
          </StyledText>
          <StyledText variant="titleMedium" style={{ color: textColor, marginTop: 4 }}>
            Vhotis Fulfillment
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
            Upgrade to Enterprise or above to rent warehouse space and let us handle
            logistics.
          </StyledText>
          <View style={[styles.badge, { borderColor: `${iconMuted}44`, backgroundColor: `${iconMuted}12` }]}>
            <StyledText variant="labelSmall" style={{ color: iconMuted }}>
              Enterprise required
            </StyledText>
          </View>
        </View>
        <View style={[styles.cta, { backgroundColor: `${tintColor}14` }]}>
          <StyledText variant="labelLarge" style={{ color: tintColor }}>
            Upgrade plan
          </StyledText>
          <MaterialIcons name="arrow-forward" size={18} color={tintColor} />
        </View>
      </Pressable>
    );
  }

  const ctaLabel =
    status === "none"
      ? "Apply now"
      : status === "pending"
        ? "View application"
        : "View fulfillment";

  const statusColor =
    status === "active" ? successColor : status === "pending" ? tintColor : iconMuted;

  const handlePress = () => {
    if (status === "active") {
      router.push("/seller/main/store/fufillment/FulfillmentDashboardScreen");
      return;
    }
    router.push("/seller/main/store/fufillment/FulfillmentOnboardingScreen");
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor: status === "active" ? `${successColor}55` : borderColor,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={styles.copy}>
        <StyledText variant="labelSmall" style={{ color: iconMuted }}>
          Recommended · Option 1
        </StyledText>
        <StyledText variant="titleMedium" style={{ color: textColor, marginTop: 4 }}>
          Vhotis Fulfillment
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 6 }}>
          Rent warehouse space — we store, pick, pack, and ship your orders.
        </StyledText>
        <View style={[styles.badge, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}12` }]}>
          <StyledText variant="labelSmall" style={{ color: statusColor }}>
            {FULFILLMENT_STATUS_LABELS[status]}
          </StyledText>
        </View>
      </View>
      <View style={[styles.cta, { backgroundColor: `${tintColor}14` }]}>
        <StyledText variant="labelLarge" style={{ color: tintColor }}>
          {ctaLabel}
        </StyledText>
        <MaterialIcons name="arrow-forward" size={18} color={tintColor} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  copy: { gap: 0 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});

export default FulfillmentStoreHubCard;
