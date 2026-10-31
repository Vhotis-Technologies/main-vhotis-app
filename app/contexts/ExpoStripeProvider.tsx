import { StripeProvider } from "@stripe/stripe-react-native";
import React from "react";
import { APP_CONFIG, STRIPE_CONFIG } from "@/constants/Config";

const publishableKey = STRIPE_CONFIG.publishableKey ?? "";

const urlScheme = Array.isArray(APP_CONFIG.scheme)
  ? APP_CONFIG.scheme[0]
  : APP_CONFIG.scheme;

  

/**
 * Root Stripe SDK wrapper for native payment sheet / Apple Pay.
 * Same role as prisma_client's ExpoStripeProvider — not a React context like Auth.
 */
export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey" | "merchantIdentifier"
  >
) {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.vhotis"
      urlScheme={urlScheme}
      {...props}
    />
  );
}
