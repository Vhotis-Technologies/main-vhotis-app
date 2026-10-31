import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppSelector } from "@/app/store/store";
import { useAuthContext } from "@/app/contexts/AuthContextProvider";
import { GuestUser, Seller, User } from "@/app/interfaces/main/Authentication";

type AccountIcon = keyof typeof MaterialIcons.glyphMap;

type AccountAction = {
  id: string;
  icon: AccountIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
};

const getAccountProfile = (
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

const BottomSheetAccoutComponent = ({ onPress }: { onPress: () => void }) => {
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuthContext();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const profile = getAccountProfile(user, isAuthenticated);

  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const errorColor = useThemeColor({}, "error");

  const closeAndRun = (action: () => void) => {
    onPress();
    action();
  };

  const actions: AccountAction[] = [
    {
      id: "manage",
      icon: "manage-accounts",
      title: "Manage profile",
      subtitle: "Edit details, password, and privacy",
      onPress: () =>
        closeAndRun(() =>
          router.push("/main/mobile/(tabs)/menu/MainSettingScreen")
        ),
    },
    {
      id: "sign-out",
      icon: "logout",
      title: "Sign out",
      subtitle: "Sign out of this account on this device",
      destructive: true,
      onPress: () => {
        onPress();
        handleLogout();
      },
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <StyledText variant="bodySmall" style={{ color: iconColor }}>
        Signed in as
      </StyledText>

      <View
        style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]}
      >
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

        <View
          style={[
            styles.activeBadge,
            {
              backgroundColor: `${tintColor}14`,
              borderColor: tintColor,
            },
          ]}
        >
          <View style={[styles.activeDot, { backgroundColor: tintColor }]} />
          <StyledText variant="labelSmall" style={{ color: tintColor }}>
            Active
          </StyledText>
        </View>
      </View>

      <View
        style={[styles.actionsCard, { backgroundColor: cardColor, borderColor }]}
      >
        {actions.map((action, index) => {
          const actionColor = action.destructive ? errorColor : tintColor;

          return (
            <Pressable
              key={action.id}
              style={[
                styles.actionRow,
                index < actions.length - 1 && styles.actionRowDivider,
                index < actions.length - 1 && { borderBottomColor: borderColor },
              ]}
              onPress={action.onPress}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: `${actionColor}14` },
                ]}
              >
                <MaterialIcons name={action.icon} size={20} color={actionColor} />
              </View>
              <View style={styles.actionCopy}>
                <StyledText
                  variant="labelLarge"
                  style={{ color: action.destructive ? errorColor : textColor }}
                >
                  {action.title}
                </StyledText>
                <StyledText variant="bodySmall" style={{ color: iconColor }}>
                  {action.subtitle}
                </StyledText>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default BottomSheetAccoutComponent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 4,
    gap: 14,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
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
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actionRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
});
