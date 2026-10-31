import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { MembershipTier } from "@/app/store/main/api/membershipApi";
import { MEMBERSHIP_BENEFITS } from "@/app/constants/membershipBenefits";

interface MembershipPlanCardProps {
  plan: MembershipTier;
  isActive: boolean;
  isCreating?: boolean;
  onSubscribe: (plan: MembershipTier) => void;
}

const MembershipPlanCard = ({
  plan,
  isActive,
  isCreating = false,
  onSubscribe,
}: MembershipPlanCardProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");

  const isFree = plan.monthlyPrice === 0;
  const ctaLabel = isActive
    ? "Current membership"
    : isFree
      ? "Activate free membership"
      : "Become a member";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: cardColor,
            borderColor,
          },
        ]}
      >
        <View style={[styles.heroAccent, { backgroundColor: `${tintColor}18` }]}>
          <View style={[styles.iconCircle, { backgroundColor: tintColor }]}>
            <MaterialIcons name="workspace-premium" size={28} color="#FFFFFF" />
          </View>

          {plan.badge ? (
            <View style={[styles.badge, { backgroundColor: `${tintColor}22` }]}>
              <StyledText
                variant="labelSmall"
                style={[styles.badgeText, { color: tintColor }]}
              >
                {plan.badge}
              </StyledText>
            </View>
          ) : null}

          <StyledText variant="headlineSmall" style={{ color: textColor }}>
            {plan.name}
          </StyledText>

          {plan.tagLine ? (
            <StyledText
              variant="bodyMedium"
              style={[styles.tagLine, { color: iconColor }]}
            >
              {plan.tagLine}
            </StyledText>
          ) : null}

          <View style={styles.priceBlock}>
            <StyledText variant="displaySmall" style={{ color: textColor }}>
              {formatCurrency(plan.monthlyPrice)}
            </StyledText>
            <StyledText variant="bodyMedium" style={{ color: iconColor }}>
              / month
            </StyledText>
          </View>

          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            Cancel anytime. Benefits renew each billing cycle.
          </StyledText>
        </View>
      </View>

      <View style={styles.benefitsSection}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          What you get
        </StyledText>

        {MEMBERSHIP_BENEFITS.map((benefit) => (
          <View
            key={benefit.id}
            style={[
              styles.benefitRow,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: `${tintColor}16` }]}>
              <MaterialIcons name={benefit.icon} size={22} color={tintColor} />
            </View>
            <View style={styles.benefitCopy}>
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                {benefit.title}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={[styles.benefitDescription, { color: iconColor }]}
              >
                {benefit.description}
              </StyledText>
            </View>
          </View>
        ))}
      </View>

      {isActive ? (
        <View
          style={[
            styles.activeBanner,
            { backgroundColor: `${successColor}18`, borderColor: successColor },
          ]}
        >
          <MaterialIcons name="check-circle" size={20} color={successColor} />
          <StyledText variant="labelMedium" style={{ color: successColor }}>
            You&apos;re an active member
          </StyledText>
        </View>
      ) : (
        <Pressable
          style={[
            styles.ctaButton,
            { backgroundColor: tintColor, opacity: isCreating ? 0.7 : 1 },
          ]}
          onPress={() => onSubscribe(plan)}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <StyledText variant="labelLarge" style={styles.ctaText}>
              {ctaLabel}
            </StyledText>
          )}
        </Pressable>
      )}
    </View>
  );
};

export default MembershipPlanCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroAccent: {
    padding: 24,
    gap: 12,
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: "RobotoMedium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tagLine: {
    textAlign: "center",
    lineHeight: 22,
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  benefitsSection: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitCopy: {
    flex: 1,
    gap: 4,
  },
  benefitDescription: {
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  ctaText: {
    color: "#FFFFFF",
    fontFamily: "RobotoMedium",
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
});
