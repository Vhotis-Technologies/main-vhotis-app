/**
 * Finance stack — owner-only screens (wallet, withdraw, analytics).
 *
 * Store admins are redirected by useRequireSellerOwner; finance APIs are
 * also blocked server-side via require_owner_finance.
 */
import React from 'react'
import { Stack } from 'expo-router'
import { useDrawerStackScreenOptions } from '@/hooks/useDrawerStackScreenOptions'
import useRequireSellerOwner from '@/app/hook/seller/useRequireSellerOwner'

const FinanceLayout = () => {
  const screenOptions = useDrawerStackScreenOptions();

  // Redirect store admins away from wallet / payout flows.
  useRequireSellerOwner();

  return (
    <Stack
      screenOptions={screenOptions}
      initialRouteName="FinanceScreen"
    >
      <Stack.Screen name="FinanceScreen" options={{ title: "Finance" }} />
      <Stack.Screen name="FinanceAnalyticScreen" options={{ title: "Analytics" }} />
      <Stack.Screen name="WalletScreen" options={{ title: "Wallet" }} />
      <Stack.Screen name="WithdrawScreen" options={{ title: "Withdraw" }} />
    </Stack>
  )
}

export default FinanceLayout
