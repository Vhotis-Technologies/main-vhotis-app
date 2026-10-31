import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

interface PermissionsState {
  location: boolean;
  notifications: boolean;
  loading: boolean;
  error: string | null;
}

interface LocationData {
  latitude: number;
  longitude: number;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionsState>({
    location: false,
    notifications: false,
    loading: true,
    error: null,
  });

  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);

  /**
   * Check current permission status without requesting
   */
  const checkPermissions = useCallback(async () => {
    try {
      const [locationStatus, notificationStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissions({
        location: locationStatus.status === "granted",
        notifications: notificationStatus.status === "granted",
        loading: false,
        error: null,
      });

      return {
        location: locationStatus.status === "granted",
        notifications: notificationStatus.status === "granted",
      };
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissions((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to check permissions",
      }));
      return { location: false, notifications: false };
    }
  }, []);

  /**
   * Request location permission and get user's coordinates
   */
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setPermissions((prev) => ({ ...prev, location: true }));

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        // Store location data
        setLocationData({
          latitude,
          longitude,
        });

        return { latitude, longitude };
      } else {
        setPermissions((prev) => ({
          ...prev,
          location: false,
          error: "Location permission denied",
        }));
        return null;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setPermissions((prev) => ({
        ...prev,
        location: false,
        error: "Failed to request location permission",
      }));
      return null;
    }
  }, []);

  /**
   * Request notification permission and get push token
   */
  const requestNotificationPermission = useCallback(async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === "granted") {
        setPermissions((prev) => ({ ...prev, notifications: true }));

        // Get push token for sending notifications
        try {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          setPushToken(token);
          console.log("Push token in usePermissions:", token);
          return token;
        } catch (error) {
          console.error("Error getting push token:", error);
        }
        return true;
      } else {
        setPermissions((prev) => ({
          ...prev,
          notifications: false,
          error: "Notification permission denied",
        }));
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setPermissions((prev) => ({
        ...prev,
        notifications: false,
        error: "Failed to request notification permission",
      }));
      return false;
    }
  }, []);

  /**
   * Request all permissions at once
   */
  const requestAllPermissions = useCallback(async () => {
    setPermissions((prev) => ({ ...prev, loading: true, error: null }));

    const [locationResult, notificationResult] = await Promise.all([
      requestLocationPermission(),
      requestNotificationPermission(),
    ]);

    setPermissions((prev) => ({ ...prev, loading: false }));

    // Extract the push token from notificationResult if it's a string (the token)
    const token =
      typeof notificationResult === "string" ? notificationResult : pushToken;

    console.log("Push token in usePermissions:", token);

    return {
      location: !!locationResult,
      notifications: !!notificationResult,
      locationData: locationResult,
      pushToken: token,
    };
  }, [requestLocationPermission, requestNotificationPermission, pushToken]);

  /**
   * Check if all required permissions are granted
   */
  const hasAllPermissions = useCallback(() => {
    return permissions.location && permissions.notifications;
  }, [permissions.location, permissions.notifications]);

  /**
   * Update user location on backend
   */
  const updateUserLocation = useCallback(
    async (
      latitude: number,
      longitude: number,
      address?: string,
      token?: string
    ) => {
      try {
        // This will be called from the context after API integration
        console.log("Update user location:", {
          latitude,
          longitude,
          address,
          push_token: token,
        });
        return true;
      } catch (error) {
        console.error("Error updating user location:", error);
        return false;
      }
    },
    []
  );

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    locationData,
    pushToken,
    requestLocationPermission,
    requestNotificationPermission,
    requestAllPermissions,
    checkPermissions,
    hasAllPermissions,
    updateUserLocation,
  };
};
