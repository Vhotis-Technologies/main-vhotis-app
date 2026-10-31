import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AccountHolderContent from "@/app/component/main/shared/settings/AccountHolderContent";
import EditProfileContent from "@/app/component/main/shared/settings/EditProfileContent";
import ChangePasswordContent from "@/app/component/main/shared/settings/ChangePasswordContent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import ToggleComponent from "@/app/component/helpers/settings/helpers/ToggleComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import { useMainSettings } from "@/app/hook/main/useMainSettings";
import { useAppSelector } from "@/app/store/store";
import { User, Seller, GuestUser } from "@/app/interfaces/main/Authentication";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { AccountHolderInterface } from "@/app/interfaces/main/profile/ProfileInterface";
import { router } from "expo-router";

type SettingsIcon = keyof typeof MaterialIcons.glyphMap;

type SettingsRow = {
  id: string;
  icon: SettingsIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type ToggleRow = {
  id: string;
  icon: SettingsIcon;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const getUserProfile = (
  user: User | Seller | GuestUser | null,
  isAuthenticated: boolean
): AccountHolderInterface & { initials: string } => {
  if (!user || !isAuthenticated) {
    return {
      id: "guest",
      name: "Guest User",
      email: "guest@example.com",
      image: undefined,
      initials: "G",
    };
  }

  if ("is_guest" in user && user.is_guest) {
    const name = user.first_name?.trim() || "Guest User";
    return {
      id: user.guest_id,
      name,
      email: "guest@example.com",
      image: undefined,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("is_seller" in user && user.is_seller) {
    const name = user.business_name?.trim() || "Business Account";
    return {
      id: user.user_id,
      name,
      email: user.email || "business@example.com",
      image: typeof user.photo === "string" ? user.photo : undefined,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("first_name" in user && "last_name" in user) {
    const name = `${user.first_name} ${user.last_name}`.trim() || "User";
    return {
      id: user.user_id,
      name,
      email: user.email,
      image: typeof user.photo === "string" ? user.photo : undefined,
      initials:
        `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase() ||
        "U",
    };
  }

  return {
    id: "unknown",
    name: "Unknown User",
    email: "unknown@example.com",
    image: undefined,
    initials: "U",
  };
};

const MainSettingsScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const errorColor = useThemeColor({}, "error");

  const { theme, setTheme } = useThemeContext();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const profile = getUserProfile(user, isAuthenticated);

  const { showCenterModal, showFullscreenModal, closeModal, showSheetModal } = useModalService();

  const {
    settings,
    toggleSetting,
    handleProfileUpdate,
    handlePasswordUpdate,
    handleLogout,
    handlePhotoChange,
  } = useMainSettings();

  const currentUser: AccountHolderInterface = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    image: profile.image,
  };

  const handleEditProfile = () => {
    showCenterModal(
      <EditProfileContent
        accountHolder={currentUser}
        onSave={(updatedProfile) => {
          handleProfileUpdate(updatedProfile);
          closeModal();
        }}
        onChangePhoto={handlePhotoChange}
      />,
      "Edit Profile"
    );
  };

  const handleChangePassword = () => {
    showCenterModal(
      <ChangePasswordContent
        onSave={(passwords) => {
          handlePasswordUpdate(passwords);
          closeModal();
        }}
      />,
      "Change Password"
    );
  };

  const handleViewAccount = () => {
    showCenterModal(
      <AccountHolderContent accountHolder={currentUser} />,
      "Account Details"
    );
  };

  const handlePrivacyAndDevices = () => {
    router.push("/main/mobile/(tabs)/menu/PrivacyAndSecurityScreen");
  };

  const profileRows: SettingsRow[] = [
    {
      id: "edit-profile",
      icon: "person",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: handleEditProfile,
    },
    {
      id: "password",
      icon: "lock",
      title: "Change Password",
      subtitle: "Update your security credentials",
      onPress: handleChangePassword,
    },
    {
      id: "privacy",
      icon: "devices",
      title: "Privacy & Security",
      subtitle: "Active sessions and account security",
      onPress: handlePrivacyAndDevices,
    },
  ];

  const notificationRows: ToggleRow[] = [
    {
      id: "push",
      icon: "notifications",
      title: "Push Notifications",
      subtitle: "Order updates and delivery alerts",
      value: settings.notifications.pushNotifications,
      onValueChange: (value) =>
        toggleSetting("notifications", "pushNotifications", value),
    },
    {
      id: "email",
      icon: "email",
      title: "Email Notifications",
      subtitle: "Receipts and account messages",
      value: settings.notifications.emailNotifications,
      onValueChange: (value) =>
        toggleSetting("notifications", "emailNotifications", value),
    },
    {
      id: "marketing",
      icon: "campaign",
      title: "Marketing Emails",
      subtitle: "Promotions and product recommendations",
      value: settings.notifications.marketingEmails,
      onValueChange: (value) =>
        toggleSetting("notifications", "marketingEmails", value),
    },
  ];

  const appearanceRows: ToggleRow[] = [
    {
      id: "dark",
      icon: "dark-mode",
      title: "Dark Mode",
      subtitle: "Use dark theme",
      value: theme === "dark",
      onValueChange: (value) => setTheme(value ? "dark" : "light"),
    },
    {
      id: "light",
      icon: "light-mode",
      title: "Light Mode",
      subtitle: "Use light theme",
      value: theme === "light",
      onValueChange: (value) => setTheme(value ? "light" : "dark"),
    },
    {
      id: "system",
      icon: "settings-system-daydream",
      title: "Use System Theme",
      subtitle: "Match your device appearance",
      value: theme === "system",
      onValueChange: (value) => setTheme(value ? "system" : "light"),
    },
  ];

  const supportRows: SettingsRow[] = [
    {
      id: "help",
      icon: "help-center",
      title: "Help Center",
      subtitle: "Get help with using the app",
      onPress: () => {},
    },
    {
      id: "feedback",
      icon: "feedback",
      title: "Send Feedback",
      subtitle: "Help us improve your experience",
      onPress: () => {},
    },
  ];

  const renderActionRow = (row: SettingsRow, isLast: boolean) => (
    <Pressable
      key={row.id}
      style={[
        styles.menuRow,
        !isLast && styles.menuRowDivider,
        !isLast && { borderBottomColor: borderColor },
      ]}
      onPress={row.onPress}
    >
      <View
        style={[styles.menuRowIconWrap, { backgroundColor: `${tintColor}14` }]}
      >
        <MaterialIcons name={row.icon} size={20} color={tintColor} />
      </View>
      <View style={styles.menuRowCopy}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {row.title}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          {row.subtitle}
        </StyledText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={iconColor} />
    </Pressable>
  );

  const renderToggleRow = (row: ToggleRow, isLast: boolean) => (
    <View
      key={row.id}
      style={[
        styles.toggleRow,
        !isLast && styles.menuRowDivider,
        !isLast && { borderBottomColor: borderColor },
      ]}
    >
      <View
        style={[styles.menuRowIconWrap, { backgroundColor: `${tintColor}14` }]}
      >
        <MaterialIcons name={row.icon} size={20} color={tintColor} />
      </View>
      <View style={styles.menuRowCopy}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {row.title}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          {row.subtitle}
        </StyledText>
      </View>
      <ToggleComponent
        label={row.title}
        value={row.value}
        onValueChange={row.onValueChange}
        size="small"
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Settings
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            Account, notifications, and appearance
          </StyledText>
        </View>

        <Pressable
          style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]}
          onPress={handleViewAccount}
        >
          <View style={styles.profileMain}>
            {profile.image ? (
              <Image source={{ uri: profile.image }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  { backgroundColor: `${tintColor}20` },
                ]}
              >
                <StyledText variant="labelLarge" style={{ color: tintColor }}>
                  {profile.initials}
                </StyledText>
              </View>
            )}

            <View style={styles.profileCopy}>
              <StyledText variant="labelLarge" style={{ color: textColor }}>
                {profile.name}
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconColor }}
                numberOfLines={1}
              >
                {profile.email}
              </StyledText>
            </View>

            <MaterialIcons name="chevron-right" size={22} color={iconColor} />
          </View>
        </Pressable>

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Profile
          </StyledText>
          <View
            style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}
          >
            {profileRows.map((row, index) =>
              renderActionRow(row, index === profileRows.length - 1)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Notifications
          </StyledText>
          <View
            style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}
          >
            {notificationRows.map((row, index) =>
              renderToggleRow(row, index === notificationRows.length - 1)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Appearance
          </StyledText>
          <View
            style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}
          >
            {appearanceRows.map((row, index) =>
              renderToggleRow(row, index === appearanceRows.length - 1)
            )}
          </View>
        </View>

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Support
          </StyledText>
          <View
            style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}
          >
            {supportRows.map((row, index) =>
              renderActionRow(row, index === supportRows.length - 1)
            )}
          </View>
        </View>

        <Pressable
          style={[
            styles.signOutButton,
            {
              backgroundColor: `${errorColor}10`,
              borderColor: `${errorColor}40`,
            },
          ]}
          onPress={() => handleLogout()}
        >
          <MaterialIcons name="logout" size={20} color={errorColor} />
          <StyledText variant="labelLarge" style={{ color: errorColor }}>
            Sign out
          </StyledText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 20,
  },
  headerCopy: {
    gap: 4,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: 10,
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuRowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  menuRowCopy: {
    flex: 1,
    gap: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 4,
  },
});
