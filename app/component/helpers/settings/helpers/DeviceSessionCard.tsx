import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { DeviceSession } from "@/app/interfaces/others/SettingsInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface DeviceSessionCardProps {
  session: DeviceSession;
  onLogout: (sessionId: string) => void;
  disabled?: boolean;
  isLast?: boolean;
}

type DeviceIcon = keyof typeof MaterialIcons.glyphMap;

function getDeviceIcon(session: DeviceSession): DeviceIcon {
  const type = `${session.deviceType ?? ""} ${session.platform ?? ""}`.toLowerCase();
  if (type.includes("tablet") || type.includes("ipad")) return "tablet";
  if (type.includes("desktop") || type.includes("web") || type.includes("windows")) {
    return "computer";
  }
  if (type.includes("android")) return "phone-android";
  if (type.includes("ios") || type.includes("iphone")) return "phone-iphone";
  return "smartphone";
}

function getPlatformLabel(session: DeviceSession): string | null {
  const parts = [session.platform, session.osVersion].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

const DeviceSessionCard = ({
  session,
  onLogout,
  disabled = false,
  isLast = false,
}: DeviceSessionCardProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const iconMuted = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error");
  const successColor = useThemeColor({}, "success");

  const platformLabel = getPlatformLabel(session);
  const deviceIcon = getDeviceIcon(session);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: cardColor },
        !isLast && styles.rowDivider,
        !isLast && { borderBottomColor: borderColor },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${tintColor}14` }]}>
        <MaterialIcons name={deviceIcon} size={22} color={tintColor} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <StyledText
            variant="labelLarge"
            style={[styles.deviceName, { color: textColor }]}
            numberOfLines={1}
          >
            {session.deviceName}
          </StyledText>
          {session.isCurrentDevice ? (
            <View
              style={[styles.currentBadge, { backgroundColor: `${successColor}18` }]}
            >
              <StyledText
                variant="labelSmall"
                style={{ color: successColor, fontWeight: "600" }}
              >
                This device
              </StyledText>
            </View>
          ) : null}
        </View>

        <StyledText variant="bodySmall" style={{ color: iconMuted }}>
          Active {session.lastActive.toLowerCase()}
        </StyledText>

        {platformLabel ? (
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 2 }}>
            {platformLabel}
          </StyledText>
        ) : null}

        {session.location ? (
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={13} color={iconMuted} />
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, flex: 1 }}
              numberOfLines={1}
            >
              {session.location}
            </StyledText>
          </View>
        ) : null}

        {!session.isCurrentDevice ? (
          <Pressable
            style={({ pressed }) => [
              styles.revokeButton,
              {
                borderColor: `${errorColor}55`,
                backgroundColor: `${errorColor}10`,
                opacity: pressed || disabled ? 0.7 : 1,
              },
            ]}
            onPress={() => !disabled && onLogout(session.id)}
            disabled={disabled}
          >
            {disabled ? (
              <ActivityIndicator size="small" color={errorColor} />
            ) : (
              <>
                <MaterialIcons name="logout" size={16} color={errorColor} />
                <StyledText variant="labelSmall" style={{ color: errorColor }}>
                  Sign out device
                </StyledText>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default DeviceSessionCard;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  deviceName: {
    flexShrink: 1,
    fontWeight: "600",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  revokeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 36,
  },
});
