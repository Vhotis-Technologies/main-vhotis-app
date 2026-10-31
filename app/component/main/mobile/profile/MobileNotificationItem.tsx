import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "../../../../interfaces/main/notifications/NotificationInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "../../../../../hooks/useThemeColor";
import { useThemeContext } from "@/app/contexts/ThemeProvider";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { getNotificationMeta } from "@/app/utils/notificationMeta";

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const MobileNotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
}) => {
  const { currentTheme } = useThemeContext();
  const isDark = currentTheme === "dark";
  const cardBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = isDark ? "#9CA3AF" : "#6B7280";

  const { icon, accent } = useMemo(
    () => getNotificationMeta(notification.title),
    [notification.title]
  );
  const displayTime = formatRelativeTime(notification.createdAt);
  const iconBg = isDark ? `${accent}28` : `${accent}18`;

  return (
    <TouchableOpacity
      style={[
        styles.wrapper,
        {
          backgroundColor: cardBackground,
          borderColor,
        },
        notification.isNew && {
          borderLeftColor: accent,
          borderLeftWidth: 3,
          backgroundColor: isDark ? `${accent}14` : `${accent}0A`,
        },
      ]}
      onPress={() => onPress?.(notification)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}, ${displayTime}`}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <StyledText
              variant="titleSmall"
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: textColor,
                  fontWeight: notification.isNew ? "700" : "600",
                },
              ]}
            >
              {notification.title}
            </StyledText>
            <StyledText
              variant="labelSmall"
              style={[styles.timeInline, { color: mutedColor }]}
            >
              {displayTime}
            </StyledText>
          </View>

          <StyledText
            variant="bodySmall"
            numberOfLines={2}
            style={[styles.details, { color: mutedColor }]}
          >
            {notification.details}
          </StyledText>

          {notification.isNew && (
            <View style={[styles.newPill, { backgroundColor: iconBg }]}>
              <View style={[styles.unreadDot, { backgroundColor: accent }]} />
              <StyledText
                variant="labelSmall"
                style={[styles.newPillText, { color: accent }]}
              >
                Unread
              </StyledText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    letterSpacing: -0.2,
  },
  timeInline: {
    fontWeight: "500",
    marginTop: 2,
    flexShrink: 0,
  },
  details: {
    lineHeight: 20,
  },
  newPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  newPillText: {
    fontWeight: "700",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
});

export default MobileNotificationItem;
