import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getExtra = () =>
  Constants.expoConfig?.extra || (Constants.manifest as any)?.extra || {};

function getGoogleClientIds() {
  const extra = getExtra();
  const webClientId = extra.googleWebClientId as string | undefined;
  const iosClientId = extra.googleIosClientId as string | undefined;
  if (!webClientId?.trim() || !iosClientId?.trim()) {
    throw new Error(
      "Missing googleWebClientId or googleIosClientId in app config (app.json extra). Rebuild after updating."
    );
  }
  return { webClientId: webClientId.trim(), iosClientId: iosClientId.trim() };
}

let configured = false;

/**
 * Call before sign-in. Safe to call multiple times.
 */
export async function ensureGoogleSignInConfigured(): Promise<void> {
  if (configured) {
    return;
  }
  const { webClientId, iosClientId } = getGoogleClientIds();
  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
    profileImageSize: 120,
  });
  configured = true;
}

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google Sign-In cancelled");
    this.name = "GoogleSignInCancelledError";
  }
}

/**
 * DEVELOPER_ERROR / code 10 means Firebase ↔ app mismatch (almost always missing SHA-1 for the keystore that signed this APK).
 * See https://react-native-google-signin.github.io/docs/troubleshooting#developer_error
 */
export function getGoogleSignInDeveloperSetupMessage(
  error: unknown
): string | undefined {
  const e = error as { message?: string; code?: string | number };
  const msg = typeof e?.message === "string" ? e.message : "";
  const lower = msg.toLowerCase();
  const code10 =
    e?.code === 10 ||
    e?.code === "10" ||
    String(e?.code) === "10";
  if (
    code10 ||
    lower.includes("developer_error") ||
    lower.includes("developer console is not set up")
  ) {
    return (
      "Google Sign-In is not linked to this build: add the SHA-1 fingerprint of the keystore that signs your app to Firebase (Project settings → Your Android app). For local debug use ~/.android/debug.keystore; for EAS use the SHA-1 from eas credentials. Then download a fresh google-services.json, replace the file in the project, run npx expo prebuild --clean, and rebuild."
    );
  }
  return undefined;
}

/**
 * Native Google Sign-In; returns an ID token for the backend `/api/v1/auth/google/` exchange.
 * Not supported on web — check Platform.OS first.
 */
export async function signInWithGoogle(): Promise<{ idToken: string }> {
  await ensureGoogleSignInConfigured();

  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type === "cancelled") {
    throw new GoogleSignInCancelledError();
  }

  const tokens = await GoogleSignin.getTokens();
  if (!tokens.idToken) {
    throw new Error(
      "Google Sign-In did not return an ID token. Ensure webClientId matches your Google Cloud OAuth web client."
    );
  }

  return { idToken: tokens.idToken };
}
