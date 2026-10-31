import * as Device from "expo-device";
import * as Location from "expo-location";

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: "mobile" | "tablet" | "desktop";
  platform: string;
  osVersion: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
}

/**
 * Get comprehensive device information using Expo Device APIs
 * This function collects device details that will be sent to the server
 * after successful authentication
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    // Get basic device info
    const deviceName = Device.deviceName || "Unknown Device";

    // Determine device type
    let deviceType: "mobile" | "tablet" | "desktop" = "mobile";
    if (Device.deviceType === Device.DeviceType.TABLET) {
      deviceType = "tablet";
    } else if (Device.deviceType === Device.DeviceType.DESKTOP) {
      deviceType = "desktop";
    }

    // Create a unique device ID using device characteristics
    const deviceId = `${Device.brand || "unknown"}-${
      Device.modelName || "unknown"
    }-${Device.osInternalBuildId || "unknown"}`
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Get location if permission is granted (optional)
    let location;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        location = {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        };
      }
    } catch (error) {
      console.log("Location permission denied or error:", error);
      // Continue without location data
    }

    return {
      deviceId,
      deviceName,
      deviceType,
      platform: Device.osName || "Unknown",
      osVersion: Device.osVersion || "Unknown",
      location,
    };
  } catch (error) {
    console.error("Error getting device info:", error);
    // Return minimal device info if there's an error
    return {
      deviceId: "unknown-device",
      deviceName: "Unknown Device",
      deviceType: "mobile",
      platform: "Unknown",
      osVersion: "Unknown",
    };
  }
};

/**
 * Get a simplified device identifier for session tracking
 * This is used to identify the current device in API calls
 */
export const getCurrentDeviceId = (): string => {
  try {
    return `${Device.brand || "unknown"}-${Device.modelName || "unknown"}-${
      Device.osInternalBuildId || "unknown"
    }`
      .replace(/\s+/g, "-")
      .toLowerCase();
  } catch (error) {
    return "unknown-device";
  }
};

/**
 * Validate device info before sending to server
 * Ensures all required fields are present
 */
export const validateDeviceInfo = (deviceInfo: DeviceInfo): boolean => {
  return !!(
    deviceInfo.deviceId &&
    deviceInfo.deviceName &&
    deviceInfo.deviceType &&
    deviceInfo.platform &&
    deviceInfo.osVersion
  );
};
