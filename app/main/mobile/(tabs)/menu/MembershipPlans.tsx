import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import useMembership from "@/app/hook/main/useMembership";
import { useGetPlansQuery } from "@/app/store/main/api/membershipApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import MembershipPlanCard from "@/app/component/main/membership/MembershipPlanCard";

const MembershipPlans = () => {
  const {
    plans,
    membership,
    handlePlanSelect,
    isCreatingMembership,
    isSubscribed,
  } = useMembership();
  const { isLoading, isError } = useGetPlansQuery();

  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const textColor = useThemeColor({}, "text");

  const plan = plans[0];
  const isActive =
    isSubscribed &&
    !!plan &&
    membership.currentPlan === plan.name &&
    membership.status === "active";

  if (isLoading) {
    return (
      <View
        style={[
          styles.centeredContainer,
          styles.loadingContainer,
          { backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color={iconColor} />
        <StyledText variant="bodyMedium" style={{ color: iconColor }}>
          Loading membership...
        </StyledText>
      </View>
    );
  }

  if (isError || !plan) {
    return (
      <View
        style={[
          styles.centeredContainer,
          styles.loadingContainer,
          { backgroundColor },
        ]}
      >
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Membership unavailable
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.emptyCopy, { color: iconColor }]}
        >
          We couldn&apos;t load the membership plan right now. Please try again
          later.
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
      <View style={styles.header}>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Vhotis Membership
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          One plan. Every perk. Delivered monthly.
        </StyledText>
      </View>

      <MembershipPlanCard
        plan={plan}
        isActive={isActive}
        isCreating={isCreatingMembership}
        onSubscribe={handlePlanSelect}
      />

      <StyledText
        variant="labelSmall"
        style={[styles.disclaimer, { color: iconColor }]}
      >
        Delivery benefits apply to eligible orders during your active membership
        period. Free delivery resets each billing cycle.
      </StyledText>
    </ScrollView>
  );
};

export default MembershipPlans;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  centeredContainer: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  header: {
    gap: 6,
  },
  emptyCopy: {
    textAlign: "center",
    lineHeight: 20,
  },
  disclaimer: {
    textAlign: "center",
    lineHeight: 18,
    opacity: 0.8,
    paddingHorizontal: 8,
  },
});
