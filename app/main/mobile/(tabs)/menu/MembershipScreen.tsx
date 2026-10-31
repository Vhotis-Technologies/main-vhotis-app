import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import useMembership from "@/app/hook/main/useMembership";
import {
  useGetCurrentMembershipQuery,
  useGetPlansQuery,
} from "@/app/store/main/api/membershipApi";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency, formatDate } from "@/app/_utils/main/helpers";
import { MEMBERSHIP_BENEFITS } from "@/app/constants/membershipBenefits";

type QuickActionProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  tintColor: string;
  textColor: string;
  iconColor: string;
  cardColor: string;
  borderColor: string;
};

const QuickActionRow = ({
  icon,
  title,
  subtitle,
  onPress,
  tintColor,
  textColor,
  iconColor,
  cardColor,
  borderColor,
}: QuickActionProps) => (
  <Pressable
    style={[styles.actionRow, { backgroundColor: cardColor, borderColor }]}
    onPress={onPress}
  >
    <View style={[styles.actionIconWrap, { backgroundColor: `${tintColor}16` }]}>
      <MaterialIcons name={icon} size={22} color={tintColor} />
    </View>
    <View style={styles.actionCopy}>
      <StyledText variant="labelLarge" style={{ color: textColor }}>
        {title}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconColor }}>
        {subtitle}
      </StyledText>
    </View>
    <MaterialIcons name="chevron-right" size={22} color={iconColor} />
  </Pressable>
);

const MembershipScreen = () => {
  const {
    plans,
    membership,
    formatStatusLabel,
    resolveStatusColor,
    handleShowInfoModal,
    handleCancelMembership,
    isSubscribed,
    isPendingCancellation,
    isCancelingMembership,
  } = useMembership();

  const { isLoading: plansLoading } = useGetPlansQuery();
  const { isLoading: membershipLoading } = useGetCurrentMembershipQuery();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");

  const plan = plans[0];
  const statusColor = isPendingCancellation
    ? warningColor
    : resolveStatusColor(membership.status);
  const accessUntilDate = membership.cancelsOn || membership.renewsOn;
  const isLoading = plansLoading || membershipLoading;

  const perkStatuses = [
    {
      id: "free-delivery",
      icon: "local-shipping" as const,
      title: "Free delivery",
      value: isSubscribed
        ? membership.freeDeliveryAvailable
          ? "Available this month"
          : "Used this month"
        : "Unlock with membership",
      tone: isSubscribed
        ? membership.freeDeliveryAvailable
          ? successColor
          : warningColor
        : iconColor,
    },
    {
      id: "priority",
      icon: "bolt" as const,
      title: "Priority delivery",
      value: isSubscribed ? "Included on every order" : "Unlock with membership",
      tone: isSubscribed ? successColor : iconColor,
    },
    {
      id: "free-over-50",
      icon: "sell" as const,
      title: "Free delivery on €50+ orders",
      value: isSubscribed
        ? membership.freeDeliveryUsed
          ? "Active on orders over €50"
          : "Starts after your free delivery"
        : "Unlock with membership",
      tone: isSubscribed ? tintColor : iconColor,
    },
  ];

  if (isLoading) {
    return (
      <View
        style={[
          styles.centeredContainer,
          styles.loadingContainer,
          { backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText variant="bodyMedium" style={{ color: iconColor }}>
          Loading your membership...
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Member Panel
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            Your perks, billing, and membership status
          </StyledText>
        </View>
        <Pressable
          style={[styles.infoButton]}
          onPress={handleShowInfoModal}
        >
          <MaterialIcons name="info-outline" size={22} color={iconColor} />
        </Pressable>
      </View>

      <View
        style={[
          styles.heroCard,
          { backgroundColor: cardColor, borderColor },
        ]}
      >
        <View style={[styles.heroAccent]}>
          <View style={[styles.heroIcon]}>
            <MaterialIcons name="workspace-premium" size={30} color={iconColor} />
          </View>

          <StyledText variant="headlineSmall" style={{ color: textColor }}>
            {isSubscribed
              ? membership.currentPlan || plan?.name || "Vhotis Member"
              : "Become a member"}
          </StyledText>

          <StyledText
            variant="bodyMedium"
            style={[styles.heroSubtitle, { color: iconColor }]}
          >
            {isSubscribed
              ? "You're getting member pricing and delivery perks on every order."
              : plan?.tagLine ||
                "One monthly plan with delivery savings and priority handling. Cancel anytime."}
          </StyledText>

          <View
            style={[
              styles.statusPill,
              {
                borderColor: isSubscribed ? statusColor : borderColor,
                backgroundColor: isSubscribed
                  ? `${statusColor}18`
                  : `${iconColor}12`,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isSubscribed ? statusColor : iconColor,
                },
              ]}
            />
            <StyledText
              variant="labelMedium"
              style={{
                color: isSubscribed ? statusColor : iconColor,
              }}
            >
              {isSubscribed
              ? isPendingCancellation
                ? "Cancels at period end"
                : formatStatusLabel(membership.status)
              : "Not a member yet"}
            </StyledText>
          </View>

          {isSubscribed ? (
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaItem}>
                <StyledText variant="labelSmall" style={{ color: iconColor }}>
                  {isPendingCancellation ? "Access until" : "Renews on"}
                </StyledText>
                <StyledText variant="labelLarge" style={{ color: textColor }}>
                  {accessUntilDate ? formatDate(accessUntilDate) : "—"}
                </StyledText>
              </View>
              <View style={[styles.heroDivider]} />
              <View style={styles.heroMetaItem}>
                <StyledText variant="labelSmall" style={{ color: iconColor }}>
                  Billing
                </StyledText>
                <StyledText variant="labelLarge" style={{ color: textColor }}>
                  {plan ? `${formatCurrency(plan.monthlyPrice)}/mo` : "Monthly"}
                </StyledText>
              </View>
            </View>
          ) : plan ? (
            <View style={styles.priceRow}>
              <StyledText variant="displaySmall" style={{ color: textColor }}>
                {formatCurrency(plan.monthlyPrice)}
              </StyledText>
              <StyledText variant="bodyMedium" style={{ color: iconColor }}>
                / month
              </StyledText>
            </View>
          ) : null}
        </View>

        {!isSubscribed && (
          <Pressable
            style={[styles.primaryCta, { backgroundColor: tintColor }]}
            onPress={() =>
              router.push("/main/mobile/(tabs)/menu/MembershipPlans")
            }
          >
            <StyledText variant="labelLarge" style={styles.primaryCtaText}>
              Join membership
            </StyledText>
          </Pressable>
        )}

        {isPendingCancellation && (
          <View
            style={[
              styles.pendingCancelBanner,
              {
                backgroundColor: `${warningColor}14`,
                borderColor: warningColor,
              },
            ]}
          >
            <MaterialIcons name="schedule" size={18} color={warningColor} />
            <StyledText
              variant="bodySmall"
              style={[styles.pendingCancelText, { color: warningColor }]}
            >
              Your membership will end on{" "}
              {accessUntilDate ? formatDate(accessUntilDate) : "your renewal date"}.
              Perks remain active until then.
            </StyledText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          {isSubscribed ? "This month's perks" : "Member perks"}
        </StyledText>

        <View style={styles.perkGrid}>
          {perkStatuses.map((perk) => (
            <View
              key={perk.id}
              style={[
                styles.perkCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View
                style={[
                  styles.perkIconWrap,
                  { backgroundColor: `${perk.tone}16` },
                ]}
              >
                <MaterialIcons name={perk.icon} size={20} color={perk.tone} />
              </View>
              <StyledText variant="labelMedium" style={{ color: textColor }}>
                {perk.title}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={[styles.perkValue, { color: perk.tone }]}
              >
                {perk.value}
              </StyledText>
            </View>
          ))}
        </View>
      </View>

      {!isSubscribed && (
        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            What members get
          </StyledText>
          {MEMBERSHIP_BENEFITS.map((benefit) => (
            <View
              key={benefit.id}
              style={[
                styles.benefitRow,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View
                style={[
                  styles.benefitIconWrap,
                  { backgroundColor: `${tintColor}16` },
                ]}
              >
                <MaterialIcons
                  name={benefit.icon}
                  size={20}
                  color={tintColor}
                />
              </View>
              <View style={styles.benefitCopy}>
                <StyledText variant="labelMedium" style={{ color: textColor }}>
                  {benefit.title}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={{ color: iconColor, lineHeight: 18 }}
                >
                  {benefit.description}
                </StyledText>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          Manage
        </StyledText>

        <QuickActionRow
          icon="receipt-long"
          title="Billing history"
          subtitle="View past membership payments"
          onPress={() =>
            router.push("/main/mobile/(tabs)/menu/MembershipBillingHistory")
          }
          tintColor={tintColor}
          textColor={textColor}
          iconColor={iconColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        <QuickActionRow
          icon="card-membership"
          title={isSubscribed ? "Membership details" : "View membership plan"}
          subtitle={
            isSubscribed
              ? "Plan info, price, and benefits"
              : "See pricing and subscribe"
          }
          onPress={() =>
            router.push("/main/mobile/(tabs)/menu/MembershipPlans")
          }
          tintColor={tintColor}
          textColor={textColor}
          iconColor={iconColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        <QuickActionRow
          icon="help-outline"
          title="How benefits work"
          subtitle="Free delivery, priority, and discounts explained"
          onPress={handleShowInfoModal}
          tintColor={tintColor}
          textColor={textColor}
          iconColor={iconColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        {isSubscribed && !isPendingCancellation && (
          <Pressable
            style={[
              styles.cancelButton,
              {
                borderColor: `${errorColor}55`,
                backgroundColor: `${errorColor}10`,
                opacity: isCancelingMembership ? 0.6 : 1,
              },
            ]}
            onPress={handleCancelMembership}
            disabled={isCancelingMembership}
          >
            {isCancelingMembership ? (
              <ActivityIndicator size="small" color={errorColor} />
            ) : (
              <>
                <MaterialIcons name="cancel" size={20} color={errorColor} />
                <StyledText variant="labelLarge" style={{ color: errorColor }}>
                  Cancel membership
                </StyledText>
              </>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

export default MembershipScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 24,
  },
  centeredContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroAccent: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSubtitle: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroMetaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  heroMetaItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  heroDivider: {
    width: 1,
    height: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  primaryCta: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontFamily: "RobotoMedium",
  },
  section: {
    gap: 12,
  },
  perkGrid: {
    gap: 10,
  },
  perkCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  perkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  perkValue: {
    lineHeight: 18,
    fontFamily: "RobotoMedium",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  benefitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitCopy: {
    flex: 1,
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  pendingCancelBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  pendingCancelText: {
    flex: 1,
    lineHeight: 18,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
  },
});
