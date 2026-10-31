import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SellerNotificationItem from "../../../component/seller/shared/SellerNotificationItem";
import {
  Notification,
  NotificationSection,
} from "../../../interfaces/main/notifications/NotificationInterface";
import { useMainNotifications } from "@/app/hook/main/useMainNotifications";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "../../../../hooks/useThemeColor";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

const NotificationScreen = () => {
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
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");

  const totalCount = notificationSections.reduce(
    (sum, section) => sum + section.data.length,
    0,
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [refreshNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.isNew) return;
      try {
        await markAsRead(notification.id);
      } catch {
        showSnackbar("Could not mark notification as read.", "error");
      }
    },
    [markAsRead, showSnackbar],
  );

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

  const renderHero = () => (
    <LinearGradient
      colors={[`${tintColor}CC`, `${tintColor}55`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={[styles.heroIcon, { backgroundColor: cardColor }]}>
        <MaterialIcons name="notifications-active" size={30} color={tintColor} />
      </View>
      <StyledText variant="headlineSmall" style={styles.heroTitle}>
        {unreadCount > 0
          ? `${unreadCount} unread`
          : "You're all caught up"}
      </StyledText>
      <StyledText variant="bodySmall" style={styles.heroHint}>
        {totalCount > 0
          ? `${totalCount} notification${totalCount === 1 ? "" : "s"} in your inbox`
          : "Order updates and account alerts will appear here"}
      </StyledText>

      {unreadCount > 0 ? (
        <Pressable
          onPress={handleMarkAllRead}
          disabled={markingAll}
          style={({ pressed }) => [
            styles.markAllChip,
            {
              backgroundColor: cardColor,
              opacity: pressed || markingAll ? 0.85 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
        >
          {markingAll ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : (
            <>
              <MaterialIcons name="done-all" size={18} color={tintColor} />
              <StyledText
                variant="labelLarge"
                style={{ color: tintColor, marginLeft: 6 }}
              >
                Mark all read
              </StyledText>
            </>
          )}
        </Pressable>
      ) : null}
    </LinearGradient>
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: NotificationSection;
  }) => {
    const sectionUnread = section.data.filter((item) => item.isNew).length;
    return (
      <View style={[styles.sectionHeader, { backgroundColor }]}>
        <StyledText
          variant="labelLarge"
          style={{ color: textColor, fontWeight: "700" }}
        >
          {section.title}
        </StyledText>
        {sectionUnread > 0 ? (
          <View style={[styles.sectionBadge, { backgroundColor: buttonColor }]}>
            <StyledText variant="labelSmall" style={styles.sectionBadgeText}>
              {sectionUnread}
            </StyledText>
          </View>
        ) : null}
      </View>
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <SellerNotificationItem
      notification={item}
      onPress={handleNotificationPress}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: `${tintColor}14`, borderColor: `${tintColor}30` },
        ]}
      >
        <MaterialIcons
          name="notifications-none"
          size={40}
          color={tintColor}
        />
      </View>
      <StyledText
        variant="titleSmall"
        style={{ color: textColor, marginTop: 16, textAlign: "center" }}
      >
        {isError ? "Couldn't load notifications" : "No notifications yet"}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={{
          color: mutedColor,
          marginTop: 8,
          textAlign: "center",
          lineHeight: 20,
          paddingHorizontal: 24,
        }}
      >
        {isError
          ? "Pull down to refresh and try again."
          : "When orders, payments, or store activity need your attention, they'll show up here."}
      </StyledText>
    </View>
  );

  if (isLoading && notificationSections.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
      <SectionList
        sections={notificationSections}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHero}
        stickySectionHeadersEnabled={false}
        style={styles.list}
        contentContainerStyle={
          notificationSections.length === 0
            ? styles.emptyContent
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  hero: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroHint: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  markAllChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
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
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
