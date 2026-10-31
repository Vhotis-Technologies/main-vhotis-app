import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import BottomSheetAccoutComponent from "@/app/component/main/mobile/profile/BottomSheetAccoutComponent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { useAppSelector } from "@/app/store/store";
import useMainProfile from "@/app/hook/main/useMainProfile";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { GuestUser, Seller, User } from "@/app/interfaces/main/Authentication";

const fallbackImage = require("@/assets/images/moutainimage.jpg");

const MAX_ACTIVITY_ITEMS = 5;
const ACTIVITY_ROW_HEIGHT = 82;
const MAX_ACTIVITY_LIST_HEIGHT = 400;

type ProfileIcon = keyof typeof MaterialIcons.glyphMap;

type QuickLink = {
  id: string;
  icon: ProfileIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const getUserProfile = (
  user: User | Seller | GuestUser | null,
  isAuthenticated: boolean
) => {
  if (!user || !isAuthenticated) {
    return {
      name: "Guest",
      email: "Sign in to sync your account",
      image: null as string | null,
      initials: "G",
    };
  }

  if ("is_guest" in user && user.is_guest) {
    const name = user.first_name?.trim() || "Guest";
    return {
      name,
      email: "Browsing as guest",
      image: null,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("is_seller" in user && user.is_seller) {
    const name = user.business_name?.trim() || "Business Account";
    return {
      name,
      email: user.email || "Seller account",
      image: typeof user.photo === "string" ? user.photo : null,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("first_name" in user && "last_name" in user) {
    const name = `${user.first_name} ${user.last_name}`.trim() || "User";
    return {
      name,
      email: user.email,
      image: typeof user.photo === "string" ? user.photo : null,
      initials:
        `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase() ||
        "U",
    };
  }

  return {
    name: "User",
    email: "Account",
    image: null,
    initials: "U",
  };
};

const ProfileScreen = () => {
  const { showSheetModal, closeModal } = useModalService();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const profile = getUserProfile(user, isAuthenticated);

  const {
    profileStats,
    wishlist,
    recentActivity,
    isLoading,
    hasError,
    refreshProfile,
    formatOrderStatus,
    getStatusColor,
  } = useMainProfile(true);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");

  const openAccountModal = () => {
    showSheetModal(
      <BottomSheetAccoutComponent onPress={() => closeModal()} />,
      "Account"
    );
  };

  const quickLinks: QuickLink[] = [
    {
      id: "orders",
      icon: "receipt-long",
      title: "My Orders",
      subtitle: "Track and reorder past purchases",
      onPress: () =>
        router.push("/main/mobile/(tabs)/profile/OrderHistoryScreen"),
    },
    {
      id: "account",
      icon: "manage-accounts",
      title: "Account",
      subtitle: "Signed-in account and sign out",
      onPress: openAccountModal,
    },
  ];

  const statItems = [
    {
      id: "orders",
      label: "Orders",
      value: profileStats?.total_orders ?? 0,
      icon: "shopping-bag" as ProfileIcon,
      tone: tintColor,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      value: profileStats?.wishlist_count ?? 0,
      icon: "favorite-border" as ProfileIcon,
      tone: warningColor,
    },
    {
      id: "completed",
      label: "Completed",
      value: profileStats?.completed_orders ?? 0,
      icon: "check-circle-outline" as ProfileIcon,
      tone: successColor,
    },
  ];

  const wishlistItems = wishlist?.items ?? [];
  const activities = recentActivity?.activities ?? [];
  const visibleActivities = activities.slice(0, MAX_ACTIVITY_ITEMS);
  const activityListHeight = Math.min(
    MAX_ACTIVITY_LIST_HEIGHT,
    visibleActivities.length * ACTIVITY_ROW_HEIGHT
  );
  const activityListScrollable =
    visibleActivities.length * ACTIVITY_ROW_HEIGHT > MAX_ACTIVITY_LIST_HEIGHT;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshProfile}
            tintColor={tintColor}
          />
        }
      >
        <View style={styles.headerCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Profile
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            Orders, wishlist, and recent activity
          </StyledText>
        </View>

        <Pressable
          style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]}
          onPress={openAccountModal}
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
              {profileStats?.member_since ? (
                <StyledText variant="labelSmall" style={{ color: iconColor }}>
                  Member since {profileStats.member_since}
                </StyledText>
              ) : null}
            </View>

            <MaterialIcons name="chevron-right" size={22} color={iconColor} />
          </View>
        </Pressable>

        <View style={styles.statsGrid}>
          {statItems.map((stat) => (
            <View
              key={stat.id}
              style={[
                styles.statCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <View
                style={[
                  styles.statIconWrap,
                  { backgroundColor: `${stat.tone}14` },
                ]}
              >
                <MaterialIcons name={stat.icon} size={18} color={stat.tone} />
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={stat.tone} />
              ) : (
                <StyledText variant="titleMedium" style={{ color: textColor }}>
                  {stat.value}
                </StyledText>
              )}
              <StyledText variant="labelSmall" style={{ color: iconColor }}>
                {stat.label}
              </StyledText>
            </View>
          ))}
        </View>

        {hasError && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: `${warningColor}14`,
                borderColor: warningColor,
              },
            ]}
          >
            <MaterialIcons name="error-outline" size={18} color={warningColor} />
            <StyledText variant="bodySmall" style={{ color: warningColor }}>
              Some profile data could not be loaded. Pull to refresh.
            </StyledText>
          </View>
        )}

        <View style={styles.section}>
          <StyledText variant="titleSmall" style={{ color: textColor }}>
            Quick links
          </StyledText>
          <View
            style={[styles.menuCard, { backgroundColor: cardColor, borderColor }]}
          >
            {quickLinks.map((link, index) => (
              <Pressable
                key={link.id}
                style={[
                  styles.menuRow,
                  index < quickLinks.length - 1 && styles.menuRowDivider,
                  index < quickLinks.length - 1 && { borderBottomColor: borderColor },
                ]}
                onPress={link.onPress}
              >
                <View
                  style={[
                    styles.menuRowIconWrap,
                    { backgroundColor: `${tintColor}14` },
                  ]}
                >
                  <MaterialIcons name={link.icon} size={20} color={tintColor} />
                </View>
                <View style={styles.menuRowCopy}>
                  <StyledText variant="labelLarge" style={{ color: textColor }}>
                    {link.title}
                  </StyledText>
                  <StyledText variant="bodySmall" style={{ color: iconColor }}>
                    {link.subtitle}
                  </StyledText>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={iconColor} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <StyledText variant="titleSmall" style={{ color: textColor }}>
              Wishlist
            </StyledText>
            {!isLoading && wishlistItems.length > 0 && (
              <StyledText variant="labelSmall" style={{ color: iconColor }}>
                {wishlistItems.length} item{wishlistItems.length === 1 ? "" : "s"}
              </StyledText>
            )}
          </View>

          {isLoading ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : wishlistItems.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wishlistScroll}
            >
              {wishlistItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.wishlistCard,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                  onPress={() =>
                    router.push(
                      `/main/mobile/(tabs)/home/ProductDescriptionScreen?id=${item.product_id}`
                    )
                  }
                >
                  <Image
                    source={
                      item.image ? { uri: item.image } : fallbackImage
                    }
                    style={styles.wishlistImage}
                    contentFit="cover"
                  />
                  <View style={styles.wishlistCopy}>
                    <StyledText
                      variant="labelMedium"
                      style={{ color: textColor }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </StyledText>
                    <StyledText variant="bodySmall" style={{ color: iconColor }}>
                      {item.category || "Product"}
                    </StyledText>
                    <StyledText variant="labelSmall" style={{ color: tintColor }}>
                      {formatCurrency(item.price)}
                    </StyledText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <MaterialIcons
                name="favorite-border"
                size={40}
                color={iconColor}
                style={{ opacity: 0.45 }}
              />
              <StyledText
                variant="bodyMedium"
                style={[styles.emptyText, { color: iconColor }]}
              >
                No items in your wishlist yet
              </StyledText>
              <StyledButton
                title="Browse Products"
                variant="tonal"
                onPress={() =>
                  router.replace("/main/mobile/(tabs)/home/HomeScreen")
                }
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <StyledText variant="titleSmall" style={{ color: textColor }}>
              Recent activity
            </StyledText>
            {activities.length > 0 && (
              <Pressable
                onPress={() =>
                  router.push("/main/mobile/(tabs)/profile/OrderHistoryScreen")
                }
              >
                <StyledText variant="labelSmall" style={{ color: tintColor }}>
                  View all
                </StyledText>
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <ActivityIndicator size="large" color={tintColor} />
              <StyledText variant="bodyMedium" style={{ color: iconColor }}>
                Loading recent activity...
              </StyledText>
            </View>
          ) : visibleActivities.length > 0 ? (
            <View
              style={[
                styles.menuCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <ScrollView
                style={{ maxHeight: activityListHeight }}
                nestedScrollEnabled
                scrollEnabled={activityListScrollable}
                showsVerticalScrollIndicator={activityListScrollable}
              >
                {visibleActivities.map((activity, index) => {
                  const statusColor = getStatusColor(activity.status);

                  return (
                    <Pressable
                      key={activity.id}
                      style={[
                        styles.activityRow,
                        { minHeight: ACTIVITY_ROW_HEIGHT },
                        index < visibleActivities.length - 1 &&
                          styles.menuRowDivider,
                        index < visibleActivities.length - 1 && {
                          borderBottomColor: borderColor,
                        },
                      ]}
                      onPress={() =>
                        router.push(
                          `/main/mobile/(tabs)/profile/OrderDetailsScreen?id=${activity.id}`
                        )
                      }
                    >
                      <View
                        style={[
                          styles.activityIconWrap,
                          { backgroundColor: `${statusColor}16` },
                        ]}
                      >
                        <MaterialIcons
                          name="shopping-bag"
                          size={20}
                          color={statusColor}
                        />
                      </View>

                      <View style={styles.activityCopy}>
                        <StyledText
                          variant="labelMedium"
                          style={{ color: textColor }}
                          numberOfLines={1}
                        >
                          Order #{activity.id}
                        </StyledText>
                        <StyledText
                          variant="bodySmall"
                          style={{ color: iconColor }}
                          numberOfLines={1}
                        >
                          {activity.items_count} item
                          {activity.items_count > 1 ? "s" : ""} ·{" "}
                          {activity.formatted_date}
                        </StyledText>
                      </View>

                      <View style={styles.activityMeta}>
                        <StyledText
                          variant="labelSmall"
                          style={{ color: textColor }}
                        >
                          {formatCurrency(activity.total_amount)}
                        </StyledText>
                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: `${statusColor}18`,
                              borderColor: statusColor,
                            },
                          ]}
                        >
                          <StyledText
                            variant="labelSmall"
                            style={{ color: statusColor }}
                          >
                            {formatOrderStatus(activity.status)}
                          </StyledText>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: cardColor, borderColor },
              ]}
            >
              <MaterialIcons
                name="history"
                size={40}
                color={iconColor}
                style={{ opacity: 0.45 }}
              />
              <StyledText
                variant="bodyMedium"
                style={[styles.emptyText, { color: iconColor }]}
              >
                Your recent orders will appear here
              </StyledText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

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
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
    minHeight: 104,
    justifyContent: "center",
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  wishlistScroll: {
    paddingRight: 4,
    gap: 12,
  },
  wishlistCard: {
    width: 148,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  wishlistImage: {
    width: "100%",
    height: 112,
  },
  wishlistCopy: {
    padding: 10,
    gap: 4,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 160,
  },
  emptyText: {
    textAlign: "center",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  activityIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
});
