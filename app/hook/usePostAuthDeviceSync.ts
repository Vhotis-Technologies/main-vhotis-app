import { useCallback } from "react";
import {
  useSendDeviceInfoMutation,
  useUpdateUserLocationMutation,
} from "@/app/store/main/api/authenticationApi";
import { getDeviceInfo, validateDeviceInfo } from "@/app/_utils/deviceInfo";
import { getExpoPushTokenIfPermittedAsync } from "@/app/_utils/expoPushToken";

type SaveDeviceInfoResponse = {
  success?: boolean;
  message?: string;
  device_session_id?: string;
  /** True when this device_id had no session yet for this user (new device). */
  is_new_device?: boolean;
};

/**
 * Registers the current device with the server (device session only).
 * When the server reports a new device, syncs Expo push token to the user model
 * via PATCH /auth/update-location/ (push_token only — no change to device payload).
 */
export function usePostAuthDeviceSync() {
  const [sendDeviceInfo] = useSendDeviceInfoMutation();
  const [updateUserLocation] = useUpdateUserLocationMutation();

  const runPostAuthDeviceSync = useCallback(async () => {
    try {
      const deviceInfo = await getDeviceInfo();
      if (!validateDeviceInfo(deviceInfo)) {
        console.warn("Invalid device info, skipping device registration");
        return;
      }

      const res = (await sendDeviceInfo(deviceInfo).unwrap()) as SaveDeviceInfoResponse;

      if (!res?.is_new_device) {
        return;
      }

      const pushToken = await getExpoPushTokenIfPermittedAsync();
      if (!pushToken) {
        return;
      }

      await updateUserLocation({ push_token: pushToken }).unwrap();
    } catch (error) {
      console.warn("Post-auth device / push token sync failed:", error);
    }
  }, [sendDeviceInfo, updateUserLocation]);

  return { runPostAuthDeviceSync };
}
