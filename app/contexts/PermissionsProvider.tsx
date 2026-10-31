import React, { createContext, useContext, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { usePermissions } from "../hook/usePermissions";
import { useModalService } from "./ModalServiceProvider";
import PermissionModal from "../component/helpers/others/PermissionModal";
import { useUpdateUserLocationMutation } from "../store/main/api/authenticationApi";


interface PermissionsContextType {
  permissions: {
    location: boolean;
    notifications: boolean;
    loading: boolean;
    error: string | null;
  };
  locationData: {
    latitude: number;
    longitude: number;
  } | null;
  pushToken: string | null;
  requestAllPermissions: () => Promise<any>;
  hasAllPermissions: () => boolean;
  updateUserLocation: (
    latitude: number,
    longitude: number,
    address?: string,
    token?: string
  ) => Promise<boolean>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const PermissionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    permissions,
    locationData,
    pushToken,
    requestAllPermissions,
    hasAllPermissions,
  } = usePermissions();

  const { showSheetModal, closeAllModals } = useModalService();
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  const [updateLocationApi] = useUpdateUserLocationMutation();

  // Function to exit the app
  const exitApp = () => {
    BackHandler.exitApp();
  };

  // Function to update user location on backend
  const updateUserLocation = async (
    latitude: number,
    longitude: number,
    token?: string
  ) => {
    console.log("Updating user location:", {
      latitude,
      longitude,
      token,
    });
    try {
      await updateLocationApi({
        latitude,
        longitude,
        push_token: token,
      }).unwrap();
      console.log("Location updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating user location:", error);
      return false;
    }
  };

  useEffect(() => {
    const initializePermissions = async () => {
      // Wait for permissions to be checked
      if (!permissions.loading && !hasCheckedPermissions) {
        setHasCheckedPermissions(true);

        // If permissions are not granted, show the blocking modal as a sheet
        if (!hasAllPermissions()) {
          showSheetModal(
            <PermissionModal
              onRequestPermissions={async () => {
                const result = await requestAllPermissions();
                if (result.location && result.notifications) {
                  // Update backend with location data
                  if (result.locationData) {
                    await updateUserLocation(
                      result.locationData.latitude,
                      result.locationData.longitude,
                      result.pushToken || undefined
                    );
                  }
                  closeAllModals();
                } else {
                  // If permissions were denied, exit the app
                  exitApp();
                }
              }}
              hasLocation={permissions.location}
              hasNotifications={permissions.notifications}
            />,
            "Permissions Required",
            () => {
              // If modal is closed without granting permissions, exit the app
              exitApp();
            }
          );
        }
      }
    };

    initializePermissions();
  }, [
    permissions.loading,
    permissions.location,
    permissions.notifications,
    hasCheckedPermissions,
    hasAllPermissions,
    showSheetModal,
    requestAllPermissions,
    updateUserLocation,
    pushToken,
    closeAllModals,
  ]);

  const value: PermissionsContextType = {
    permissions,
    locationData,
    pushToken,
    requestAllPermissions,
    hasAllPermissions,
    updateUserLocation,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error(
      "usePermissionsContext must be used within a PermissionsProvider"
    );
  }
  return context;
};
