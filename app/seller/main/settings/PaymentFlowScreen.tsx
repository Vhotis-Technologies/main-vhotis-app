import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useGetConnectStatusQuery,
  useOpenExpressDashboardMutation,
  useRefreshConnectStatusMutation,
  useStartConnectOnboardingMutation,
} from "@/app/store/seller/api/connectApi";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const statusLabel = (isReady: boolean, status?: string) => {
  if (isReady) return "Ready for payouts";
  if (status === "restricted") return "Action needed";
  if (status === "pending") return "Pending review";
  return "Not set up yet";
};

const statusHint = (isReady: boolean, status?: string) => {
  if (isReady) {
    return "Your Stripe Connect account can receive earnings. Bank payouts run weekly.";
  }
  if (status === "restricted") {
    return "Stripe needs more information before payouts can continue.";
  }
  if (status === "pending") {
    return "Finish or wait for Stripe to finish reviewing your payout setup.";
  }
  return "Connect with Stripe so you can directly manage your transactions with Stripe.";
};

const scheduleLabel = (
  interval?: string,
  weeklyAnchor?: string | null,
) => {
  if (!interval) return "Weekly · Monday";
  if (interval === "weekly" && weeklyAnchor) {
    const day =
      weeklyAnchor.charAt(0).toUpperCase() + weeklyAnchor.slice(1);
    return `Weekly · ${day}`;
  }
  return interval.charAt(0).toUpperCase() + interval.slice(1);
};

const truncateAccountId = (id?: string | null) => {
  if (!id) return "—";
  if (id.length <= 18) return id;
  return `${id.slice(0, 10)}…${id.slice(-4)}`;
};

const extractError = (e: unknown, fallback: string) => {
  if (
    typeof e === "object" &&
    e !== null &&
    "data" in e &&
    typeof (e as { data?: { error?: string } }).data?.error === "string"
  ) {
    return (e as { data: { error: string } }).data.error;
  }
  if (e instanceof Error) return e.message;
  return fallback;
};

type ActionRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  iconColor: string;
  iconBg: string;
  textColor: string;
  mutedColor: string;
  cardColor: string;
  borderColor: string;
};

const ActionRow = ({
  icon,
  title,
  subtitle,
  onPress,
  loading,
  disabled,
  iconColor,
  iconBg,
  textColor,
  mutedColor,
  cardColor,
  borderColor,
}: ActionRowProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    style={({ pressed }) => [
      styles.actionRow,
      {
        backgroundColor: cardColor,
        borderColor,
        opacity: disabled && !loading ? 0.55 : pressed ? 0.88 : 1,
      },
    ]}
  >
    <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
      <MaterialIcons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.actionCopy}>
      <StyledText variant="labelLarge" style={{ color: textColor }}>
        {title}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={{ color: mutedColor, marginTop: 2 }}
        numberOfLines={2}
      >
        {subtitle}
      </StyledText>
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={iconColor} />
    ) : (
      <MaterialIcons name="chevron-right" size={22} color={mutedColor} />
    )}
  </Pressable>
);

const PaymentFlowScreen = () => {
  const { isBlocked } = useRequireSellerOwner();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");
  const buttonColor = useThemeColor({}, "button");

  const { data: connect, isFetching, refetch } = useGetConnectStatusQuery(
    undefined,
    { skip: isBlocked },
  );
  const [startOnboarding, { isLoading: isStarting }] =
    useStartConnectOnboardingMutation();
  const [refreshStatus, { isLoading: isRefreshing }] =
    useRefreshConnectStatusMutation();
  const [openDashboard, { isLoading: isOpeningDashboard }] =
    useOpenExpressDashboardMutation();

  const [formError, setFormError] = useState<string | null>(null);

  const feePercent = connect?.processing_fee_percent ?? 2.5;
  const isReady = Boolean(connect?.is_ready);
  const canManage =
    Boolean(connect?.can_open_express_dashboard) || isReady;
  const anyBusy = isStarting || isRefreshing || isOpeningDashboard;

  const statusTone = useMemo(() => {
    if (isReady) {
      return {
        badgeBg: `${successColor}18`,
        badgeColor: successColor,
        icon: "check-circle" as const,
      };
    }
    if (connect?.status === "restricted") {
      return {
        badgeBg: `${errorColor}14`,
        badgeColor: errorColor,
        icon: "error-outline" as const,
      };
    }
    if (connect?.status === "pending") {
      return {
        badgeBg: `${tintColor}14`,
        badgeColor: tintColor,
        icon: "hourglass-top" as const,
      };
    }
    return {
      badgeBg: `${iconMuted}16`,
      badgeColor: iconMuted,
      icon: "account-balance-wallet" as const,
    };
  }, [connect?.status, errorColor, iconMuted, isReady, successColor, tintColor]);

  const primaryTitle = useMemo(() => {
    if (isReady) return "Update Stripe details";
    if (!connect?.account_id || connect.status === "not_started") {
      return "Set up payouts with Stripe";
    }
    return "Continue Stripe setup";
  }, [connect?.account_id, connect?.status, isReady]);

  const openStripe = async () => {
    setFormError(null);
    try {
      const started = await startOnboarding().unwrap();
      if (!started.onboarding_url) {
        throw new Error("Stripe did not return an onboarding link");
      }
      const supported = await Linking.canOpenURL(started.onboarding_url);
      if (!supported) {
        throw new Error("Cannot open Stripe onboarding link on this device");
      }
      await Linking.openURL(started.onboarding_url);
    } catch (e) {
      setFormError(extractError(e, "Could not start Stripe Connect setup."));
    }
  };

  const openExpressDashboard = async () => {
    setFormError(null);
    try {
      const result = await openDashboard().unwrap();
      if (!result.express_dashboard_url) {
        throw new Error("Stripe did not return an Express Dashboard link");
      }
      const supported = await Linking.canOpenURL(result.express_dashboard_url);
      if (!supported) {
        throw new Error("Cannot open Stripe Express Dashboard on this device");
      }
      await Linking.openURL(result.express_dashboard_url);
    } catch (e) {
      setFormError(extractError(e, "Could not open Stripe Express Dashboard."));
    }
  };

  const syncStatus = async () => {
    setFormError(null);
    try {
      await refreshStatus().unwrap();
      await refetch();
    } catch (e) {
      setFormError(extractError(e, "Could not refresh Stripe status."));
    }
  };

  if (isBlocked) {
    return <View style={[styles.centered, { backgroundColor }]} />;
  }

  if (isFetching && !connect) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 12 }}
        >
          Loading payout setup…
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: cardColor, borderColor }]}>
        <View
          style={[styles.statusBadge, { backgroundColor: statusTone.badgeBg }]}
        >
          <MaterialIcons
            name={statusTone.icon}
            size={18}
            color={statusTone.badgeColor}
          />
          <StyledText
            variant="labelMedium"
            style={{ color: statusTone.badgeColor, marginLeft: 6 }}
          >
            {statusLabel(isReady, connect?.status)}
          </StyledText>
        </View>

        <StyledText
          variant="titleLarge"
          style={[styles.heroTitle, { color: textColor }]}
        >
          Payout account
        </StyledText>
        <StyledText variant="bodyMedium" style={{ color: iconMuted }}>
          {statusHint(isReady, connect?.status)}
        </StyledText>
      </View>

      <View style={[styles.metaCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <MaterialIcons name="event-repeat" size={18} color={iconMuted} />
            <StyledText
              variant="bodyMedium"
              style={{ color: iconMuted, marginLeft: 10 }}
            >
              Bank schedule
            </StyledText>
          </View>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {scheduleLabel(
              connect?.payout_schedule?.interval,
              connect?.payout_schedule?.weekly_anchor,
            )}
          </StyledText>
        </View>
        <View style={[styles.metaDivider, { backgroundColor: borderColor }]} />
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <MaterialIcons name="percent" size={18} color={iconMuted} />
            <StyledText
              variant="bodyMedium"
              style={{ color: iconMuted, marginLeft: 10 }}
            >
              Processing fee
            </StyledText>
          </View>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {feePercent}%
          </StyledText>
        </View>
        <View style={[styles.metaDivider, { backgroundColor: borderColor }]} />
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <MaterialIcons name="fingerprint" size={18} color={iconMuted} />
            <StyledText
              variant="bodyMedium"
              style={{ color: iconMuted, marginLeft: 10 }}
            >
              Stripe account
            </StyledText>
          </View>
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            {truncateAccountId(connect?.account_id)}
          </StyledText>
        </View>
      </View>

      <StyledText
        variant="labelMedium"
        style={[styles.sectionLabel, { color: iconMuted }]}
      >
        Actions
      </StyledText>

      <StyledButton
        title={primaryTitle}
        onPress={() => {
          void openStripe();
        }}
        variant="medium"
        loading={isStarting}
        disabled={anyBusy && !isStarting}
        buttonStyles={styles.primaryButton}
      />

      <View style={styles.actionList}>
        {canManage ? (
          <ActionRow
            icon="open-in-new"
            title="Manage Stripe account"
            subtitle="Update bank details and view payout history in Stripe Express"
            onPress={() => {
              void openExpressDashboard();
            }}
            loading={isOpeningDashboard}
            disabled={anyBusy && !isOpeningDashboard}
            iconColor={buttonColor}
            iconBg={`${buttonColor}16`}
            textColor={textColor}
            mutedColor={iconMuted}
            cardColor={cardColor}
            borderColor={borderColor}
          />
        ) : null}

        {connect?.account_id ? (
          <ActionRow
            icon="sync"
            title="Refresh status"
            subtitle="Pull the latest Connect readiness from Stripe"
            onPress={() => {
              void syncStatus();
            }}
            loading={isRefreshing}
            disabled={anyBusy && !isRefreshing}
            iconColor={tintColor}
            iconBg={`${tintColor}14`}
            textColor={textColor}
            mutedColor={iconMuted}
            cardColor={cardColor}
            borderColor={borderColor}
          />
        ) : null}
      </View>

      {formError ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: `${errorColor}12`, borderColor: `${errorColor}35` },
          ]}
        >
          <MaterialIcons name="error-outline" size={18} color={errorColor} />
          <StyledText
            variant="bodySmall"
            style={{ color: errorColor, marginLeft: 8, flex: 1 }}
          >
            {formError}
          </StyledText>
        </View>
      ) : null}

      <StyledText variant="bodySmall" style={[styles.footnote, { color: iconMuted }]}>
        Bank details stay with Stripe. After delivery, earnings transfer to your
        Connect balance (minus the {feePercent}% fee), then Stripe pays your bank
        on the weekly schedule set by Vhotis.
      </StyledText>
    </ScrollView>
  );
};

export default PaymentFlowScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    gap: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroTitle: {
    marginTop: 4,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 12,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  metaDivider: {
    height: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    marginTop: 4,
    marginLeft: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionList: {
    gap: 10,
  },
  actionRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  footnote: {
    lineHeight: 20,
    marginTop: 2,
    paddingHorizontal: 2,
  },
});
