import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UserDetails } from "@/app/interfaces/others/SettingsInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "../forms/StyledText";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  isStoreAdminUser,
} from "@/app/interfaces/main/Authentication";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";

interface DetailDisplayComponentProps {
  userDetails: UserDetails;
}

type DetailField = {
  key: string;
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

function getAvatarSource(photo: Seller["photo"]) {
  const fallback = require("@/assets/images/user_image.jpg");
  if (!photo) return fallback;
  if (typeof photo === "string" && photo.length > 0) return { uri: photo };
  if (typeof photo === "object" && photo !== null && "uri" in photo) {
    const uri = (photo as { uri?: string }).uri;
    if (typeof uri === "string" && uri.length > 0) return { uri };
  }
  return fallback;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SE";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const DetailDisplayComponent: React.FC<DetailDisplayComponentProps> = ({
  userDetails,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const seller = user as Seller | null;

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");

  const displayData = useMemo(() => {
    if (!seller) {
      return {
        displayName: `${userDetails.firstName} ${userDetails.lastName}`.trim(),
        email: userDetails.email,
        phone: userDetails.phone ?? "",
        country: userDetails.country,
        timezone: userDetails.timezone,
        address: userDetails.address ?? "",
        city: userDetails.city ?? "",
        bio: userDetails.bio,
        roleLabel: userDetails.role,
        isVerified: false,
        photo: null as Seller["photo"],
      };
    }

    const isAdmin = isStoreAdminUser(seller);
    const displayName =
      seller.business_name?.trim() ||
      seller.email?.split("@")[0] ||
      "Your account";

    return {
      displayName,
      email: seller.email ?? "",
      phone: seller.phone ?? "",
      country: seller.address?.country ?? seller.business_country ?? "",
      timezone: "Europe/London",
      address: seller.address?.address ?? "",
      city: seller.address?.city ?? seller.business_city ?? "",
      bio:
        seller.business_description?.trim() ||
        (isAdmin
          ? "Team member for this store location."
          : "Store owner on Vhotis."),
      roleLabel: isAdmin ? "Store admin" : "Store owner",
      isVerified: Boolean(seller.is_verified),
      photo: seller.photo,
    };
  }, [seller, userDetails]);

  const contactFields: DetailField[] = [
    {
      key: "email",
      label: "Email",
      value: displayData.email || "—",
      icon: "email",
    },
    {
      key: "phone",
      label: "Phone",
      value: displayData.phone || "—",
      icon: "phone",
    },
    {
      key: "timezone",
      label: "Timezone",
      value: displayData.timezone || "—",
      icon: "schedule",
    },
  ];

  const locationFields: DetailField[] = [
    {
      key: "country",
      label: "Country",
      value: displayData.country || "—",
      icon: "public",
    },
    {
      key: "address",
      label: "Address",
      value: displayData.address || "—",
      icon: "home",
    },
    {
      key: "city",
      label: "City",
      value: displayData.city || "—",
      icon: "location-city",
    },
  ];

  const hasPhoto =
    displayData.photo &&
    ((typeof displayData.photo === "string" && displayData.photo.length > 0) ||
      (typeof displayData.photo === "object" && displayData.photo !== null));

  const renderField = (field: DetailField, isLast: boolean) => (
    <View
      key={field.key}
      style={[
        styles.fieldRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor },
      ]}
    >
      <View style={[styles.fieldIconWrap, { backgroundColor: `${tintColor}14` }]}>
        <MaterialIcons name={field.icon} size={18} color={tintColor} />
      </View>
      <View style={styles.fieldTextCol}>
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {field.label}
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 2 }}
          numberOfLines={3}
        >
          {field.value}
        </StyledText>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[`${tintColor}CC`, `${tintColor}55`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatarWrap}>
          {hasPhoto ? (
            <Image
              source={getAvatarSource(displayData.photo)}
              style={[styles.avatar, { borderColor: cardColor }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarFallback,
                { borderColor: cardColor, backgroundColor: cardColor },
              ]}
            >
              <StyledText variant="headlineSmall" style={{ color: tintColor }}>
                {getInitials(displayData.displayName)}
              </StyledText>
            </View>
          )}
          {displayData.isVerified ? (
            <View style={[styles.verifiedBadge, { borderColor: cardColor }]}>
              <MaterialIcons name="verified" size={16} color={tintColor} />
            </View>
          ) : null}
        </View>

        <StyledText variant="headlineSmall" style={styles.heroName}>
          {displayData.displayName}
        </StyledText>
        <StyledText variant="bodyMedium" style={styles.heroEmail}>
          {displayData.email || "—"}
        </StyledText>

        <View style={[styles.roleChip, { backgroundColor: cardColor }]}>
          <MaterialIcons
            name={displayData.roleLabel === "Store admin" ? "badge" : "store"}
            size={14}
            color={tintColor}
          />
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, marginLeft: 6 }}
          >
            {displayData.roleLabel}
          </StyledText>
        </View>
      </LinearGradient>

      <View style={styles.sections}>
        <OnboardingSectionCard
          icon="contact-mail"
          title="Contact"
          subtitle="How buyers and Vhotis reach you"
        >
          {contactFields.map((field, index) =>
            renderField(field, index === contactFields.length - 1),
          )}
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="place"
          title="Location"
          subtitle="Where your store operates"
        >
          {locationFields.map((field, index) =>
            renderField(field, index === locationFields.length - 1),
          )}
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="notes"
          title="About"
          subtitle="Short description on your profile"
        >
          <StyledText
            variant="bodyMedium"
            style={{ color: textColor, lineHeight: 22 }}
          >
            {displayData.bio || "No bio added yet."}
          </StyledText>
        </OnboardingSectionCard>
      </View>
    </ScrollView>
  );
};

export default DetailDisplayComponent;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  hero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    padding: 2,
  },
  heroName: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroEmail: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    textAlign: "center",
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sections: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
  },
  fieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldTextCol: {
    flex: 1,
    paddingTop: 2,
  },
});
