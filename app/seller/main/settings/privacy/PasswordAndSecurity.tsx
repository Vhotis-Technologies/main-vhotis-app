import React, { useLayoutEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import AccountPasswordFlowView from "@/app/component/helpers/settings/privacy/AccountPasswordFlowView";
import WalletCodeFlowView from "@/app/component/helpers/settings/privacy/WalletCodeFlowView";
import {
  PASSWORD_SECURITY_FLOWS,
  PASSWORD_SECURITY_FLOW_PARAM,
  parsePasswordSecurityFlow,
  PASSWORD_SECURITY_SCREEN_TITLES,
} from "@/app/seller/main/settings/privacy/passwordSecurityFlow";
import { useAppSelector } from "@/app/store/store";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";

const PasswordAndSecurity = () => {
  const navigation = useNavigation();
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const isStoreAdmin = isStoreAdminUser(user);
  const backgroundColor = useThemeColor({}, "background");
  const mutedColor = useThemeColor({}, "icons");

  const params = useLocalSearchParams<{
    [PASSWORD_SECURITY_FLOW_PARAM]?: string | string[];
  }>();

  const flow = parsePasswordSecurityFlow(params[PASSWORD_SECURITY_FLOW_PARAM]);
  const isWalletFlow =
    flow === PASSWORD_SECURITY_FLOWS.WALLET ||
    flow === PASSWORD_SECURITY_FLOWS.BOTH;

  useRequireSellerOwner(
    "/seller/main/settings/privacy/PrivacyAndSecurityScreen",
    isWalletFlow,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: PASSWORD_SECURITY_SCREEN_TITLES[flow],
    });
  }, [flow, navigation]);

  const showPassword =
    flow === PASSWORD_SECURITY_FLOWS.PASSWORD ||
    flow === PASSWORD_SECURITY_FLOWS.BOTH;
  const showWallet = isWalletFlow && !isStoreAdmin;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor }]}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {flow === PASSWORD_SECURITY_FLOWS.BOTH && (
        <StyledText variant="bodySmall" style={{ color: mutedColor }}>
          Manage login password and your financial wallet code below.
        </StyledText>
      )}

      {showPassword && <AccountPasswordFlowView />}

      {showWallet && (
        <View
          style={
            flow === PASSWORD_SECURITY_FLOWS.BOTH
              ? styles.walletAfterPassword
              : undefined
          }
        >
          {flow === PASSWORD_SECURITY_FLOWS.BOTH && (
            <>
              <StyledText variant="titleSmall" style={{ color: mutedColor }}>
                Financial wallet code
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={[styles.walletIntro, { color: mutedColor }]}
              >
                Used for withdrawals and sensitive finance actions.
              </StyledText>
            </>
          )}
          <WalletCodeFlowView />
        </View>
      )}
    </ScrollView>
  );
};

export default PasswordAndSecurity;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
    paddingTop: 8,
  },
  walletAfterPassword: {
    marginTop: 16,
    gap: 8,
  },
  walletIntro: {
    marginBottom: 4,
    lineHeight: 20,
  },
});
