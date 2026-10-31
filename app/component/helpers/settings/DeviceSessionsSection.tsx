import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import DeviceSessionCard from "./helpers/DeviceSessionCard";
import { DeviceSession } from "@/app/interfaces/others/SettingsInterface";
import StyledText from "../forms/StyledText";
import { useAppSelector } from "@/app/store/store";
import {
  useGetDeviceSessionsQuery,
  useLogoutDeviceSessionMutation,
} from "@/app/store/main/api/authenticationApi";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { useThemeColor } from "@/hooks/useThemeColor";

const DeviceSessionsSection = () => {
  const { access } = useAppSelector((state) => state.auth);
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { showSnackbarWithConfig } = useSnackbar();

  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error");

  const {
    data: deviceSessionsData,
    isLoading: loading,
    error: queryError,
    refetch: refetchDeviceSessions,
    isFetching,
  } = useGetDeviceSessionsQuery(undefined, {
    skip: !access,
  });

  const [logoutDeviceSession, { isLoading: isLoggingOut }] =
    useLogoutDeviceSessionMutation();

  const deviceSessions: DeviceSession[] = deviceSessionsData?.sessions ?? [];
  const error = queryError ? "Failed to fetch device sessions" : null;
  const otherSessions = deviceSessions.filter((s) => !s.isCurrentDevice);

  const handleLogout = async (sessionId: string) => {
    setAlertConfig({
      title: "Sign out this device?",
      message:
        "This device will be logged out of your account. You can sign in again anytime.",
      type: "warning",
      onConfirm: async () => {
        try {
          await logoutDeviceSession(sessionId).unwrap();
          refetchDeviceSessions();
          showSnackbarWithConfig({
            message: "Device signed out",
            type: "success",
            duration: 2500,
          });
        } catch (logoutErr) {
          console.error("Error logging out device:", logoutErr);
          showSnackbarWithConfig({
            message: "Failed to sign out device",
            type: "error",
            duration: 3000,
          });
        }
      },
      onClose: () => setIsVisible(false),
      isVisible: true,
    });
  };

  const handleLogoutAllOthers = () => {
    if (otherSessions.length === 0) return;

    setAlertConfig({
      title: "Sign out all other devices?",
      message: `This will end ${otherSessions.length} active session${otherSessions.length === 1 ? "" : "s"}. Your current device will stay signed in.`,
      type: "warning",
      onConfirm: async () => {
        try {
          await Promise.all(
            otherSessions.map((session) =>
              logoutDeviceSession(session.id).unwrap()
            )
          );
          refetchDeviceSessions();
          showSnackbarWithConfig({
            message: "Other devices signed out",
            type: "success",
            duration: 2500,
          });
        } catch (logoutErr) {
          console.error("Error logging out devices:", logoutErr);
          showSnackbarWithConfig({
            message: "Some devices could not be signed out",
            type: "error",
            duration: 3000,
          });
        }
      },
      onClose: () => setIsVisible(false),
      isVisible: true,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="small" color={tintColor} />
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 8 }}>
            Loading active sessions...
          </StyledText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateWrap}>
          <MaterialIcons name="error-outline" size={28} color={errorColor} />
          <StyledText variant="bodyMedium" style={{ color: errorColor, marginTop: 8 }}>
            {error}
          </StyledText>
          <Pressable onPress={() => refetchDeviceSessions()} style={styles.retryButton}>
            <StyledText variant="labelSmall" style={{ color: tintColor }}>
              Try again
            </StyledText>
          </Pressable>
        </View>
      );
    }

    if (deviceSessions.length === 0) {
      return (
        <View style={styles.stateWrap}>
          <MaterialIcons name="devices" size={28} color={iconMuted} />
          <StyledText variant="bodyMedium" style={{ color: textColor, marginTop: 8 }}>
            No active sessions
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, textAlign: "center", marginTop: 4 }}
          >
            When you sign in on a device, it will appear here.
          </StyledText>
        </View>
      );
    }

    return deviceSessions.map((session, index) => (
      <DeviceSessionCard
        key={session.id}
        session={session}
        onLogout={handleLogout}
        disabled={isLoggingOut}
        isLast={index === deviceSessions.length - 1}
      />
    ));
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Active sessions
          </StyledText>
          {!loading && deviceSessions.length > 0 ? (
            <View style={[styles.countBadge, { backgroundColor: `${tintColor}14` }]}>
              <StyledText variant="labelSmall" style={{ color: tintColor }}>
                {deviceSessions.length}
              </StyledText>
            </View>
          ) : null}
        </View>
        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          Devices currently signed in to your account
        </StyledText>
      </View>

      <View style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}>
        {renderContent()}
      </View>

      {otherSessions.length > 1 ? (
        <Pressable
          style={({ pressed }) => [
            styles.signOutOthers,
            {
              borderColor: `${errorColor}40`,
              backgroundColor: `${errorColor}10`,
              opacity: pressed || isLoggingOut ? 0.75 : 1,
            },
          ]}
          onPress={handleLogoutAllOthers}
          disabled={isLoggingOut}
        >
          <MaterialIcons name="logout" size={18} color={errorColor} />
          <StyledText variant="labelMedium" style={{ color: errorColor }}>
            Sign out all other devices
          </StyledText>
        </Pressable>
      ) : null}

      {isFetching && !loading ? (
        <StyledText variant="bodySmall" style={[styles.refreshHint, { color: iconMuted }]}>
          Refreshing sessions...
        </StyledText>
      ) : null}
    </View>
  );
};

export default DeviceSessionsSection;

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  menuCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  stateWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  signOutOthers: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  refreshHint: {
    textAlign: "center",
  },
});
