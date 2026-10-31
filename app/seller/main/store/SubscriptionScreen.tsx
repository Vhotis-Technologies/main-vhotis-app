import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import useSellerSubcription from "@/app/hook/seller/useSellerSubcription";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SubscriptionStatus } from "@/app/interfaces/seller/SubscriptionInterface";
import { formatDate, formatCurrency } from "@/app/_utils/main/helpers";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useAppSelector, RootState } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const formatStatusLabel = (status?: SubscriptionStatus) => {
  if (!status) return "Status unavailable";
  return status
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const SubscriptionScreen = () => {
  useRequireSellerOwner();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state: RootState) => state.auth) as {
    user: Seller;
  };
  const { subscription, pendingUpgrade, selectedPlan, isSubscribed } =
    useSellerSubcription();

  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = iconColor;

  const resolveStatusColor = (status?: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return successColor;
      case "pending":
        return warningColor;
      case "past_due":
        return warningColor;
      default:
        return mutedTextColor;
    }
  };

  const statusColor = resolveStatusColor(subscription.status);
  const billingCycleLabel =
    subscription.billingCycle === "yearly" ? "Annual" : "Monthly";

  const planPrice =
    subscription.billingCycle === "yearly"
      ? selectedPlan?.yearlyPrice
      : selectedPlan?.monthlyPrice;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 28 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.quickActions}>
        <Pressable
          onPress={() => router.push("/seller/main/store/ManagementScreen")}
          style={({ pressed }) => [
            styles.quickAction,
            {
              backgroundColor: cardColor,
              borderColor,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <MaterialIcons name="tune" size={22} color={tintColor} />
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Management
          </StyledText>
        </Pressable>
        <Pressable
          onPress={() => router.push("/seller/main/store/BillingHistoryScreen")}
          style={({ pressed }) => [
            styles.quickAction,
            {
              backgroundColor: cardColor,
              borderColor,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <MaterialIcons name="receipt-long" size={22} color={tintColor} />
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Billing
          </StyledText>
        </Pressable>
      </View>

      <LinearGradient
        colors={[`${tintColor}28`, `${tintColor}06`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, { borderColor }]}
      >
        <View style={styles.heroTop}>
          <View style={[styles.avatarRing, { borderColor: tintColor }]}>
            <Image
              source={require("@/assets/images/user_image.jpg")}
              style={styles.avatar}
            />
          </View>
          <View style={styles.heroCopy}>
            <StyledText variant="labelMedium" style={{ color: mutedTextColor }}>
              Store owner
            </StyledText>
            <StyledText
              variant="titleMedium"
              style={{ color: textColor, fontWeight: "700" }}
              numberOfLines={1}
            >
              {user?.business_name || "Your store"}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: mutedTextColor }}
              numberOfLines={1}
            >
              {user?.email}
            </StyledText>
          </View>
        </View>

        {subscription.currentPlan && isSubscribed ? (
          <>
            <View style={styles.planRow}>
              <View style={styles.planTitleWrap}>
                <MaterialIcons
                  name="workspace-premium"
                  size={28}
                  color={tintColor}
                />
                <View style={{ flex: 1 }}>
                  <StyledText
                    variant="titleLarge"
                    style={{ color: textColor, fontWeight: "800" }}
                  >
                    {subscription.currentPlan}
                  </StyledText>
                  {planPrice !== undefined ? (
                    <StyledText
                      variant="bodySmall"
                      style={{ color: mutedTextColor }}
                    >
                      {formatCurrency(planPrice)} · {billingCycleLabel}
                    </StyledText>
                  ) : null}
                </View>
              </View>
              <View style={[styles.statusPill, { borderColor: statusColor }]}>
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <StyledText
                  variant="labelSmall"
                  style={{ color: statusColor, fontWeight: "600" }}
                >
                  {formatStatusLabel(subscription.status)}
                </StyledText>
              </View>
            </View>

            {subscription.renewsOn ? (
              <View
                style={[styles.renewRow, { backgroundColor: `${cardColor}99` }]}
              >
                <MaterialIcons name="event" size={18} color={iconColor} />
                <StyledText variant="bodySmall" style={{ color: textColor }}>
                  Renews {formatDate(subscription.renewsOn)}
                </StyledText>
              </View>
            ) : null}

            {pendingUpgrade ? (
              <View
                style={[
                  styles.renewRow,
                  { backgroundColor: `${warningColor}18`, marginTop: 12 },
                ]}
              >
                <MaterialIcons
                  name="hourglass-top"
                  size={18}
                  color={warningColor}
                />
                <StyledText
                  variant="bodySmall"
                  style={{ color: textColor, flex: 1 }}
                >
                  Upgrade to {pendingUpgrade.currentPlan} is awaiting payment
                  confirmation. If you already paid, pull to refresh this
                  screen.
                </StyledText>
              </View>
            ) : null}

            <StyledButton
              title="Change plan"
              onPress={() =>
                router.push("/seller/main/store/SubscriptionPlans")
              }
              variant="tonal"
              buttonStyles={styles.heroButton}
            />
          </>
        ) : (
          <View style={styles.noPlanBlock}>
            <StyledText variant="titleMedium" style={{ color: textColor }}>
              No active plan
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: mutedTextColor, lineHeight: 20 }}
            >
              Subscribe to list more products, unlock analytics, and grow your
              store on Vhotis.
            </StyledText>
            <StyledButton
              title="View plans"
              onPress={() =>
                router.push("/seller/main/store/SubscriptionPlans")
              }
              variant="medium"
              buttonStyles={styles.heroButton}
            />
          </View>
        )}
      </LinearGradient>

      <View
        style={[styles.tipCard, { backgroundColor: cardColor, borderColor }]}
      >
        <MaterialIcons name="lightbulb-outline" size={22} color={tintColor} />
        <View style={styles.tipCopy}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Annual billing
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: mutedTextColor, marginTop: 4 }}
          >
            Save on yearly plans when you upgrade from the plans screen.
          </StyledText>
        </View>
      </View>
    </ScrollView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  planTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  renewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  heroButton: {
    alignSelf: "stretch",
    marginTop: 4,
  },
  noPlanBlock: {
    gap: 10,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  tipCopy: {
    flex: 1,
  },
});
