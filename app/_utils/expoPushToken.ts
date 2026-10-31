import * as Notifications from "expo-notifications";

/**
 * Returns the Expo push token only if notification permission is already granted.
 * Does not prompt — use PermissionModal / explicit request flows for that.
 */
export async function getExpoPushTokenIfPermittedAsync(): Promise<
  string | null
> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      return null;
    }
    const { data } = await Notifications.getExpoPushTokenAsync();
    return data || null;
  } catch (e) {
    console.warn("getExpoPushTokenIfPermittedAsync:", e);
    return null;
  }
}
