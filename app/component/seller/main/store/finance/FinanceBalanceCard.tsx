import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatWalletAmount } from "@/app/hook/seller/useSellerStore";

type FinanceBalanceCardProps = {
  availableBalance: number | string;
  pendingBalance?: number | string;
  currencyCode?: string;
  isLoading?: boolean;
  onWithdraw?: () => void;
  onOpenWallet?: () => void;
};

const toNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const FinanceBalanceCard = ({
  availableBalance,
  pendingBalance,
  currencyCode = "EUR",
  isLoading,
  onWithdraw,
  onOpenWallet,
}: FinanceBalanceCardProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <StyledText variant="bodySmall" style={{ color: iconMuted }}>
            Available balance
          </StyledText>
          <StyledText
            variant="displaySmall"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={[styles.balance, { color: textColor }]}
          >
            {isLoading
              ? "—"
              : formatWalletAmount(toNumber(availableBalance), undefined, currencyCode)}
          </StyledText>
          {pendingBalance !== undefined && (
            <View style={styles.pendingRow}>
              <MaterialIcons
                name="hourglass-top"
                size={14}
                color={iconMuted}
              />
              <StyledText
                variant="bodySmall"
                style={[styles.pendingText, { color: iconMuted }]}
              >
                {`Pending ${formatWalletAmount(toNumber(pendingBalance), undefined, currencyCode)}`}
              </StyledText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onWithdraw}
          disabled={!onWithdraw || isLoading}
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryAction,
            { backgroundColor: textColor, opacity: pressed ? 0.85 : 1 },
            (!onWithdraw || isLoading) && styles.disabled,
          ]}
        >
          <MaterialIcons name="north-east" size={16} color={cardColor} />
          <StyledText
            variant="labelLarge"
            style={[styles.primaryActionText, { color: cardColor }]}
          >
            Withdraw
          </StyledText>
        </Pressable>

        <Pressable
          onPress={onOpenWallet}
          disabled={!onOpenWallet}
          style={({ pressed }) => [
            styles.actionButton,
            styles.secondaryAction,
            {
              backgroundColor,
              borderColor,
              opacity: pressed ? 0.7 : 1,
            },
            !onOpenWallet && styles.disabled,
          ]}
        >
          <MaterialIcons
            name="account-balance-wallet"
            size={16}
            color={textColor}
          />
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Wallet
          </StyledText>
        </Pressable>
      </View>
    </View>
  );
};

export default FinanceBalanceCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  balance: {
    fontWeight: "800",
    letterSpacing: -1,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  pendingText: {
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  primaryAction: {
    borderWidth: 0,
  },
  primaryActionText: {
    fontWeight: "700",
  },
  secondaryAction: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
