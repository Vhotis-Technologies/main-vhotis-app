import Constants from "expo-constants";

// Function to get config with fallbacks
const getConfig = () => {
  const config =
    Constants.expoConfig?.extra || (Constants.manifest as any)?.extra || {};
  return config;
};

const config = getConfig();

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: config.stripe?.publishableKey,
};

// API Configuration with fallbacks for testing
export const API_CONFIG = {
  baseURL: config.baseURL,
  websocketUrl: config.websocketURL,
};

// Google Maps: native keys in app.json — android.config.googleMaps.apiKey, ios.config.googleMapsApiKey (prebuild → manifest/plist). Runtime: extra.googoleApiKeys (Prisma client pattern).
export const GOOGLE_MAPS_CONFIG = {
  apiKey: config.googleApiKey || "AIzaSyDsgqiUNxSePJD9GIGd-ILcp2MByBNBhLE",
};

export const APP_CONFIG = {
  name: Constants.expoConfig?.name || "Vhotis",
  version: Constants.expoConfig?.version || "1.0.0",
  scheme: Constants.expoConfig?.scheme || "vhotisapp",
  projectId:
    Constants.expoConfig?.extra?.eas?.projectId ||
    "ac79b848-48e7-4d3b-8175-bdae8a3d8739",
};

// Validation
if (!STRIPE_CONFIG.publishableKey) {
  console.warn("Missing Stripe publishable key in app configuration");
}
