import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../../../../hooks/useThemeColor";
import NotificationItem from "../../../../component/main/mobile/profile/MobileNotificationItem";
import {
  Notification,
  NotificationSection,
} from "../../../../interfaces/main/notifications/NotificationInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useMainNotifications } from "@/app/hook/main/useMainNotifications";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

const MobileNotificationScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const {
    notificationSections,
    unreadCount,
    isLoading,
    isError,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useMainNotifications();

  const { showSnackbar } = useSnackbar();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const cardColor = useThemeColor({}, "cards");

  const totalCount = notificationSections.reduce(
    (sum, section) => sum + section.data.length,
    0
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [refreshNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    try {
      await markAllAsRead();
      showSnackbar("All notifications marked as read", "success");
    } catch {
      showSnackbar("Could not mark all as read. Try again.", "error");
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount, markingAll, markAllAsRead, showSnackbar]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (notification.isNew) {
        try {
          await markAsRead(notification.id);
        } catch {
          // Keep UI responsive if mark-as-read fails
        }
      }
    },
    [markAsRead]
  );

  const renderListHeader = () => (
    <View
      style={[
        styles.actionsBar,
        { borderBottomColor: borderColor, backgroundColor },
      ]}
    >
      <View style={styles.summaryBlock}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </StyledText>
        {totalCount > 0 && (
          <StyledText
            variant="labelSmall"
            style={[styles.totalLabel, { color: textColor, opacity: 0.5 }]}
          >
            {totalCount} notification{totalCount === 1 ? "" : "s"}
          </StyledText>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.markAllButton,
          {
            backgroundColor: unreadCount > 0 ? buttonColor : cardColor,
            borderColor: unreadCount > 0 ? buttonColor : borderColor,
          },
        ]}
        onPress={handleMarkAllRead}
        disabled={unreadCount === 0 || markingAll}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Mark all notifications as read"
        accessibilityState={{ disabled: unreadCount === 0 }}
      >
        {markingAll ? (
          <ActivityIndicator
            size="small"
            color={unreadCount > 0 ? "#FFFFFF" : textColor}
          />
        ) : (
          <>
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={unreadCount > 0 ? "#FFFFFF" : textColor}
              style={{ opacity: unreadCount > 0 ? 1 : 0.4 }}
            />
            <StyledText
              variant="labelMedium"
              style={[
                styles.markAllLabel,
                {
                  color: unreadCount > 0 ? "#FFFFFF" : textColor,
                  opacity: unreadCount > 0 ? 1 : 0.4,
                },
              ]}
            >
              Mark all read
            </StyledText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: NotificationSection;
  }) => (
    <View style={[styles.sectionHeader, { backgroundColor }]}>
      <StyledText
        variant="titleSmall"
        style={[styles.sectionHeaderText, { color: textColor }]}
      >
        {section.title}
      </StyledText>
      {section.data.some((n) => n.isNew) && (
        <View style={[styles.sectionBadge, { backgroundColor: buttonColor }]}>
          <StyledText variant="labelSmall" style={styles.sectionBadgeText}>
            {section.data.filter((n) => n.isNew).length}
          </StyledText>
        </View>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem notification={item} onPress={handleNotificationPress} />
  );

  if (isLoading && notificationSections.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SectionList
        sections={notificationSections}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        stickySectionHeadersEnabled={false}
        style={[styles.list, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          notificationSections.length === 0
            ? styles.emptyContent
            : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={textColor}
              style={{ opacity: 0.3, marginBottom: 12 }}
            />
            <StyledText style={[styles.emptyText, { color: textColor }]}>
              {isError
                ? "Could not load notifications. Pull to refresh."
                : "No notifications yet."}
            </StyledText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  summaryBlock: {
    flex: 1,
    gap: 2,
  },
  totalLabel: {
    fontWeight: "500",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 128,
    justifyContent: "center",
  },
  markAllLabel: {
    fontWeight: "600",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionHeaderText: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
});

export default MobileNotificationScreen;
