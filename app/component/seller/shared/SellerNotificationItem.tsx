import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Notification } from "../../../interfaces/main/notifications/NotificationInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { getSellerNotificationMeta } from "@/app/utils/notificationMeta";

interface SellerNotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

const SellerNotificationItem = ({
  notification,
  onPress,
}: SellerNotificationItemProps) => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const { icon, accent } = useMemo(
    () => getSellerNotificationMeta(notification.title),
    [notification.title],
  );
  const displayTime = formatRelativeTime(notification.createdAt);

  return (
    <Pressable
      onPress={() => onPress?.(notification)}
      style={({ pressed }) => [
        styles.wrapper,
        {
          backgroundColor: notification.isNew ? `${accent}10` : cardColor,
          borderColor: notification.isNew ? `${accent}35` : borderColor,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}, ${displayTime}`}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialIcons name={icon} size={22} color={accent} />
          {notification.isNew ? (
            <View style={[styles.unreadDot, { backgroundColor: accent }]} />
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <StyledText
              variant="labelLarge"
              numberOfLines={1}
              style={{
                color: textColor,
                fontWeight: notification.isNew ? "700" : "600",
                flex: 1,
              }}
            >
              {notification.title}
            </StyledText>
            <StyledText
              variant="labelSmall"
              style={{ color: mutedColor, marginLeft: 8 }}
            >
              {displayTime}
            </StyledText>
          </View>

          <StyledText
            variant="bodySmall"
            numberOfLines={2}
            style={{ color: mutedColor, lineHeight: 20, marginTop: 4 }}
          >
            {notification.details}
          </StyledText>
        </View>
      </View>
    </Pressable>
  );
};

export default SellerNotificationItem;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
