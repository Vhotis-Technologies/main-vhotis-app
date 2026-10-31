import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import SubscriptionTier from "@/app/interfaces/seller/SubscriptionInterface";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";

export type SubscriptionBillingCycle = "monthly" | "yearly";

interface SubscriptionTierComponentProps {
  plan: SubscriptionTier;
  billingCycle?: SubscriptionBillingCycle;
  isActive?: boolean;
  isFeatured?: boolean;
  cardWidth: number;
  onSelect?: (plan: SubscriptionTier) => void;
  style?: ViewStyle;
}

const SubscriptionTierComponent: React.FC<SubscriptionTierComponentProps> = ({
  plan,
  billingCycle = "monthly",
  isActive,
  isFeatured,
  cardWidth,
  onSelect,
  style,
}) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const backgroundColor = useThemeColor({}, "background");

  const features = useMemo(() => plan.features ?? [], [plan.features]);

  const { amount, monthlyEquivalent } = useMemo(() => {
    const monthly = plan.monthlyPrice ?? 0;
    const yearly = plan.yearlyPrice ?? 0;
    if (billingCycle === "yearly") {
      return {
        amount: yearly,
        monthlyEquivalent: yearly > 0 ? yearly / 12 : 0,
      };
    }
    return { amount: monthly, monthlyEquivalent: monthly };
  }, [billingCycle, plan.monthlyPrice, plan.yearlyPrice]);

  const isFree = amount === 0;
  const showFeatured = isFeatured || Boolean(plan.badge);

  const primaryCtaText = useMemo(() => {
    if (isActive) return "Current plan";
    if (isFree) return "Start free";
    return "Choose plan";
  }, [isFree, isActive]);

  const handleSelect = () => {
    if (!isActive && onSelect) {
      onSelect(plan);
    }
  };

  const accentGradient = showFeatured
    ? ([`${tintColor}40`, `${tintColor}08`] as const)
    : ([`${textColor}12`, `${textColor}04`] as const);

  return (
    <View style={[{ width: cardWidth }, style]}>
      <Pressable
        onPress={handleSelect}
        disabled={isActive}
        style={({ pressed }) => [
          styles.pressable,
          {
            opacity: pressed && !isActive ? 0.94 : 1,
            borderColor: isActive ? tintColor : borderColor,
            borderWidth: isActive ? 2 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { backgroundColor: cardColor }]}
        >
          <View style={styles.topRow}>
            <View style={styles.titleBlock}>
              <StyledText
                variant="titleLarge"
                style={[styles.planName, { color: textColor }]}
                numberOfLines={1}
              >
                {plan.name}
              </StyledText>
              {plan.tagLine ? (
                <StyledText
                  variant="bodySmall"
                  style={{ color: iconMuted }}
                  numberOfLines={2}
                >
                  {plan.tagLine}
                </StyledText>
              ) : null}
            </View>
            {plan.badge ? (
              <View style={[styles.badge, { backgroundColor: tintColor }]}>
                <StyledText variant="labelSmall" style={styles.badgeText}>
                  {plan.badge}
                </StyledText>
              </View>
            ) : isActive ? (
              <View style={[styles.badge, { backgroundColor: `${tintColor}33` }]}>
                <MaterialIcons name="verified" size={14} color={tintColor} />
              </View>
            ) : null}
          </View>

          <View style={styles.priceBlock}>
            <StyledText
              variant="displaySmall"
              style={[styles.priceText, { color: textColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(amount)}
            </StyledText>
            <StyledText variant="bodySmall" style={{ color: iconMuted }}>
              {billingCycle === "yearly" ? "per year" : "per month"}
            </StyledText>
            {billingCycle === "yearly" && !isFree && monthlyEquivalent > 0 ? (
              <StyledText variant="labelSmall" style={{ color: tintColor, marginTop: 4 }}>
                {formatCurrency(monthlyEquivalent)}/mo billed annually
              </StyledText>
            ) : null}
          </View>

          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor: isActive ? `${iconMuted}30` : tintColor,
              },
            ]}
            onPress={handleSelect}
            disabled={isActive || !onSelect}
          >
            {isActive ? (
              <MaterialIcons name="check-circle" size={18} color={textColor} />
            ) : null}
            <StyledText
              variant="labelLarge"
              style={{
                color: isActive ? textColor : backgroundColor,
                fontWeight: "700",
              }}
            >
              {primaryCtaText}
            </StyledText>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <StyledText
            variant="labelMedium"
            style={[styles.featuresHeading, { color: iconMuted }]}
          >
            What&apos;s included
          </StyledText>

          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View
                key={`${plan.id}-feature-${index}`}
                style={styles.featureRow}
              >
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${tintColor}22` },
                  ]}
                >
                  <MaterialIcons name="check" size={14} color={tintColor} />
                </View>
                <StyledText
                  variant="bodySmall"
                  style={[styles.featureText, { color: textColor }]}
                >
                  {feature}
                </StyledText>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

export default SubscriptionTierComponent;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 28,
    overflow: "hidden",
  },
  card: {
    borderRadius: 26,
    padding: 20,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  planName: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 0.6,
  },
  priceBlock: {
    gap: 2,
  },
  priceText: {
    fontWeight: "800",
    letterSpacing: -1,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  featuresHeading: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
  },
  featureList: {
    gap: 10,
    paddingBottom: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  featureText: {
    flex: 1,
    lineHeight: 20,
  },
});
