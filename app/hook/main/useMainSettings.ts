import { useState } from "react";
import { UserSettings } from "@/app/interfaces/main/settings/SettingsInterface";
import { AccountHolderInterface } from "@/app/interfaces/main/profile/ProfileInterface";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";

// Note: Account holder data is now provided by the component using real user data from Redux store

/**
 * Custom hook for managing main settings functionality
 * Handles account switching, settings toggles, and modal management
 */
export const useMainSettings = () => {
  const { handleLogout } = useAuthContext();

  // Note: Modal state is now handled by ModalServiceProvider

  // Mock initial settings
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      marketingEmails: false,
    },
    theme: {
      lightMode: false,
      darkMode: false,
      useSystemTheme: true,
    },
  });

  /**
   * Toggle a specific setting value
   * @param category - The settings category (notifications, theme, etc.)
   * @param setting - The specific setting name
   * @param value - The new boolean value
   */
  const toggleSetting = (
    category: keyof UserSettings,
    setting: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  /**
   * Handle profile update after editing
   * @param updatedProfile - The updated profile information
   */
  const handleProfileUpdate = (updatedProfile: AccountHolderInterface) => {
    // Here you would typically make an API call to update the profile
    console.log("Profile updated:", updatedProfile);
  };

  /**
   * Handle password update
   * @param passwords - Object containing current, new, and confirm passwords
   */
  const handlePasswordUpdate = (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // Here you would typically make an API call to update the password
    console.log("Updating password:", passwords);
  };

  /**
   * Handle photo change for profile
   */
  const handlePhotoChange = () => {
    // Implement photo change logic here
    console.log("Changing photo...");
  };

  return {
    // State
    settings,

    // Actions
    toggleSetting,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleLogout,
    handlePhotoChange,
  };
};
