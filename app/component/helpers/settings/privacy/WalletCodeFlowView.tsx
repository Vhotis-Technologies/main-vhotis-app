import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCheckWalletCodeStatusQuery } from "@/app/store/seller/api/financeApi";
import WalletCodeForm from "@/app/component/seller/main/store/finance/WalletCodeForm";

/**
 * Seller wallet PIN: setup, verify-and-change flows via finances API.
 */
const WalletCodeFlowView = () => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");

  const { data, isLoading, error, refetch } = useCheckWalletCodeStatusQuery();
  const [verifiedStepDone, setVerifiedStepDone] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <ActivityIndicator />
        <StyledText
          variant="bodySmall"
          style={[styles.marginTopSm, { color: mutedColor }]}
        >
          Checking wallet code status…
        </StyledText>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <StyledText style={[styles.walletErr, { color: textColor }]}>
          Could not load wallet code status.
        </StyledText>
        <Pressable onPress={() => refetch()} style={styles.retryPress}>
          <StyledText variant="labelLarge" style={{ color: mutedColor }}>
            Tap to retry
          </StyledText>
        </Pressable>
      </View>
    );
  }

  const hasCode = Boolean(data.has_wallet_code);

  if (!hasCode) {
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          Wallet code
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.sectionHint, { color: mutedColor }]}
        >
          Protect withdrawals and payouts with a 4–6 digit code stored on our
          servers.
        </StyledText>
        <WalletCodeForm
          hideIconCircle
          mode="setup"
          onSuccess={() => {
            refetch();
          }}
        />
      </View>
    );
  }

  if (!verifiedStepDone) {
    return (
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          Change wallet code
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[styles.sectionHint, { color: mutedColor }]}
        >
          Verify your current code first; then choose a new one.
        </StyledText>
        <WalletCodeForm
          hideIconCircle
          mode="verify"
          title="Confirm current wallet code"
          description="Enter the wallet code you use today for withdrawals."
          primaryButtonLabel="Continue"
          onSuccess={() => setVerifiedStepDone(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <Pressable
        onPress={() => setVerifiedStepDone(false)}
        hitSlop={8}
        style={styles.changeLink}
      >
        <StyledText variant="labelMedium" style={{ color: mutedColor }}>
          Back to verification
        </StyledText>
      </Pressable>
      <StyledText variant="titleSmall" style={{ color: textColor }}>
        New wallet code
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={[styles.sectionHint, { color: mutedColor }]}
      >
        Make sure your new codes match below.
      </StyledText>
      <WalletCodeForm
        hideIconCircle
        mode="setup"
        title="Choose a new wallet code"
        primaryButtonLabel="Save new wallet code"
        onSuccess={() => {
          setVerifiedStepDone(false);
          refetch();
        }}
      />
    </View>
  );
};

export default WalletCodeFlowView;

const styles = StyleSheet.create({
  sectionHint: {
    marginBottom: 8,
    marginTop: 4,
    lineHeight: 20,
  },
  marginTopSm: {
    marginTop: 12,
    textAlign: "center",
  },
  walletErr: {
    textAlign: "center",
  },
  retryPress: {
    marginTop: 12,
    alignSelf: "center",
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginHorizontal: -2,
    overflow: "hidden",
  },
  changeLink: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
});
