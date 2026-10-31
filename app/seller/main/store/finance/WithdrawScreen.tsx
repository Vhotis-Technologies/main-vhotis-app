import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";

/**
 * Manual bank withdrawals are retired. Earnings transfer to Stripe Connect
 * automatically after delivery (net of the 2.5% processing fee).
 */
const WithdrawScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
        <MaterialIcons name="account-balance" size={36} color={tintColor} />
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, marginTop: 16, textAlign: "center" }}
        >
          Payouts run through Stripe Connect
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{ color: iconMuted, marginTop: 10, textAlign: "center" }}
        >
          Manual bank withdrawals are disabled. After an order is delivered,
          your earnings (minus a 2.5% processing fee) transfer into your Stripe
          Connect account. Set up or update bank details with Stripe.
        </StyledText>
        <StyledButton
          title="Open payout setup"
          onPress={() => router.push("/seller/main/settings/PaymentFlowScreen")}
          variant="medium"
          buttonStyles={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    width: "100%",
  },
});

export default WithdrawScreen;
