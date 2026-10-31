import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";
import { useAppSelector } from "@/app/store/store";
import { useGetCurrentMembershipQuery } from "@/app/store/main/api/membershipApi";
import { GuestUser, Seller, User } from "@/app/interfaces/main/Authentication";

type MenuIcon = keyof typeof MaterialIcons.glyphMap;

type MenuRowItem = {
  id: string;
  icon: MenuIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
};

const getUserProfile = (
  user: User | Seller | GuestUser | null,
  isAuthenticated: boolean
) => {
  if (!user || !isAuthenticated) {
    return {
      id: "guest",
      name: "Guest",
      email: "Sign in to sync your account",
      image: null as string | null,
      initials: "G",
    };
  }

  if ("is_guest" in user && user.is_guest) {
    const name = user.first_name?.trim() || "Guest";
    return {
      id: user.guest_id,
      name,
      email: "Browsing as guest",
      image: null,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("is_seller" in user && user.is_seller) {
    const name = user.business_name?.trim() || "Business Account";
    return {
      id: user.user_id,
      name,
      email: user.email || "Seller account",
      image: typeof user.photo === "string" ? user.photo : null,
      initials: name.charAt(0).toUpperCase(),
    };
  }

  if ("first_name" in user && "last_name" in user) {
    const name = `${user.first_name} ${user.last_name}`.trim() || "User";
    return {
      id: user.user_id,
      name,
      email: user.email,
      image: typeof user.photo === "string" ? user.photo : null,
      initials: `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase() || "U",
    };
  }

  return {
    id: "unknown",
    name: "User",
    email: "Account",
    image: null,
    initials: "U",
  };
};

const MenuScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");

  const { handleLogout } = useAuthContext();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const profile = getUserProfile(user, isAuthenticated);

  const { data: membershipData } = useGetCurrentMembershipQuery(undefined, {
    skip: !isAuthenticated || ("is_guest" in (user ?? {}) && (user as GuestUser).is_guest),
  });

  const membership = membershipData?.membership;
  const isMember = membership?.status === "active";

  const membershipSubtitle = isMember
    ? "Active membership"
    : "Join for delivery perks";

  const accountItems: MenuRowItem[] = [
    {
      id: "profile",
      icon: "person",
      title: "Profile",
      subtitle: "View and edit your details",
      onPress: () => router.push("/main/mobile/(tabs)/profile/ProfileScreen"),
    },
    {
      id: "settings",
      icon: "settings",
      title: "Settings",
      subtitle: "App preferences and options",
      onPress: () => router.push("/main/mobile/(tabs)/menu/MainSettingScreen"),
    },
    {
      id: "notifications",
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage alerts and updates",
      onPress: () =>
        router.push("/main/mobile/(tabs)/menu/MobileNotificationScreen"),
    },
  ];

  const supportItems: MenuRowItem[] = [
    {
      id: "support",
      icon: "support-agent",
      title: "Customer Support",
      subtitle: "Get help with your orders",
      onPress: () =>
        router.push(
          "/main/mobile/(screens)/(support)/TicketListScreen"
        ),
    },
    {
      id: "help",
      icon: "help-center",
      title: "Help Center",
      subtitle: "Browse help articles",
      onPress: () => router.push("/main/mobile/(tabs)/menu/MainSettingScreen"),
    },
    {
      id: "legal",
      icon: "gavel",
      title: "Legal",
      subtitle: "Terms, privacy, and policies",
      onPress: () => {},
    },
  ];

  const renderMenuRow = (item: MenuRowItem, isLast: boolean) => {
    const rowTint = item.destructive ? errorColor : tintColor;

    return (
      <Pressable
        key={item.id}
        style={[
          styles.menuRow,
          !isLast && styles.menuRowDivider,
          !isLast && { borderBottomColor: borderColor },
        ]}
        onPress={item.onPress}
      >
        <View
          style={[
            styles.menuRowIconWrap,
            { backgroundColor: `${rowTint}14` },
          ]}
        >
          <MaterialIcons
            name={item.icon}
            size={20}
            color={rowTint}
          />
        </View>
        <View style={styles.menuRowCopy}>
          <StyledText
            variant="labelLarge"
            style={{ color: item.destructive ? errorColor : textColor }}
          >
            {item.title}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            {item.subtitle}
          </StyledText>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={iconColor} />
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCopy}>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Menu
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          Account, membership, and support
        </StyledText>
      </View>

      <Pressable
        style={[
          styles.profileCard,
          { backgroundColor: cardColor, borderColor },
        ]}
        onPress={() => router.push("/main/mobile/(tabs)/profile/ProfileScreen")}
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

        {isMember && (
          <View
            style={[
              styles.memberBadge,
              {
                backgroundColor: `${successColor}14`,
                borderColor: successColor,
              },
            ]}
          >
            <MaterialIcons name="verified" size={14} color={successColor} />
            <StyledText variant="labelSmall" style={{ color: successColor }}>
              Vhotis Member
            </StyledText>
          </View>
        )}
      </Pressable>

      <Pressable
        style={[
          styles.membershipBanner,
          { backgroundColor: cardColor, borderColor },
        ]}
        onPress={() => router.push("/main/mobile/(tabs)/menu/MembershipScreen")}
      >
        <View
          style={[
            styles.membershipIconWrap,
            { backgroundColor: `${tintColor}16` },
          ]}
        >
          <MaterialIcons name="workspace-premium" size={24} color={tintColor} />
        </View>
        <View style={styles.membershipCopy}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Member Panel
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: iconColor }}>
            {membershipSubtitle}
          </StyledText>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={iconColor} />
      </Pressable>

      <View style={styles.section}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          Your account
        </StyledText>
        <View
          style={[
            styles.menuCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {accountItems.map((item, index) =>
            renderMenuRow(item, index === accountItems.length - 1)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <StyledText variant="titleSmall" style={{ color: textColor }}>
          Support
        </StyledText>
        <View
          style={[
            styles.menuCard,
            { backgroundColor: cardColor, borderColor },
          ]}
        >
          {supportItems.map((item, index) =>
            renderMenuRow(item, index === supportItems.length - 1)
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
  );
};

export default MenuScreen;

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
    gap: 14,
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
  memberBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  membershipBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  membershipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  membershipCopy: {
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
