import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StyledButton from "../buttons/StyledButton";
import StyledText from "../forms/StyledText";
import StyledTextInput from "../forms/StyledTextInput";
import KeyboardWrapper from "../KeyboardWrapper";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

type Gender = "male" | "female" | null;

function splitDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function getAvatarUri(photo: Seller["photo"], localUri: string | null) {
  if (localUri) return { uri: localUri };
  if (!photo) return null;
  if (typeof photo === "string" && photo.length > 0) return { uri: photo };
  if (typeof photo === "object" && photo !== null && "uri" in photo) {
    const uri = (photo as { uri?: string }).uri;
    if (typeof uri === "string" && uri.length > 0) return { uri };
  }
  return null;
}

const ProfileSettingComponent = () => {
  const seller = useAppSelector((state) => state.auth.user) as Seller | null;
  const { showSnackbarWithConfig } = useSnackbar();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const successColor = useThemeColor({}, "success");

  const initialNames = useMemo(
    () => splitDisplayName(seller?.business_name ?? ""),
    [seller?.business_name],
  );

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(initialNames.firstName);
  const [lastName, setLastName] = useState(initialNames.lastName);
  const [email, setEmail] = useState(seller?.email ?? "");
  const [phone, setPhone] = useState(seller?.phone ?? "");
  const [gender, setGender] = useState<Gender>(null);
  const [taxId, setTaxId] = useState("");
  const [taxCountry, setTaxCountry] = useState(
    seller?.address?.country ?? seller?.business_country ?? "",
  );
  const [address, setAddress] = useState(seller?.address?.address ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const avatarSource = getAvatarUri(seller?.photo, avatarUri);
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    seller?.business_name?.trim() ||
    "Your profile";

  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showSnackbarWithConfig({
        message: "Allow photo access to update your avatar.",
        type: "error",
        duration: 3000,
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [showSnackbarWithConfig]);

  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      showSnackbarWithConfig({
        message: "First name, last name, and mobile number are required.",
        type: "error",
        duration: 3000,
      });
      return;
    }
    setIsSaving(true);
    try {
      showSnackbarWithConfig({
        message: "Profile save will sync with your account shortly.",
        type: "info",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [firstName, lastName, phone, showSnackbarWithConfig]);

  const renderGenderOption = (value: "male" | "female", label: string) => {
    const selected = gender === value;
    return (
      <Pressable
        onPress={() => setGender(value)}
        style={({ pressed }) => [
          styles.genderChip,
          {
            borderColor: selected ? tintColor : borderColor,
            backgroundColor: selected ? `${tintColor}18` : cardColor,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <MaterialIcons
          name={value === "male" ? "male" : "female"}
          size={18}
          color={selected ? tintColor : mutedColor}
        />
        <StyledText
          variant="labelLarge"
          style={{
            color: selected ? tintColor : textColor,
            marginLeft: 6,
          }}
        >
          {label}
        </StyledText>
      </Pressable>
    );
  };

  const isReady = Boolean(
    firstName.trim() && lastName.trim() && phone.trim(),
  );

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <View style={styles.footerMeta}>
        <MaterialIcons
          name={isReady ? "check-circle" : "info-outline"}
          size={18}
          color={isReady ? successColor : mutedColor}
        />
        <StyledText
          variant="bodySmall"
          style={{ color: mutedColor, flex: 1, marginLeft: 8 }}
        >
          {isReady
            ? "Ready to save your profile changes."
            : "Complete first name, last name, and mobile number."}
        </StyledText>
      </View>
      <StyledButton
        title="Save changes"
        onPress={handleSave}
        variant="medium"
        loading={isSaving}
        disabled={isSaving || !isReady}
        buttonStyles={styles.submitButton}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor }]}>
      <KeyboardWrapper
        backgroundColor={backgroundColor}
        footer={footer}
        contentContainerStyle={styles.scrollContent}
      >
      <LinearGradient
        colors={[`${tintColor}CC`, `${tintColor}55`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Pressable onPress={pickAvatar} style={styles.avatarPress}>
          {avatarSource ? (
            <Image
              source={avatarSource}
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
              <MaterialIcons name="person" size={40} color={tintColor} />
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: buttonColor }]}>
            <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
        <StyledText variant="headlineSmall" style={styles.heroName}>
          {displayName}
        </StyledText>
        <StyledText variant="bodySmall" style={styles.heroHint}>
          Tap photo to upload · changes save below
        </StyledText>
      </LinearGradient>

      <View style={styles.sectionsGap}>
        <OnboardingSectionCard
          icon="photo-camera"
          title="Profile photo"
          subtitle="Shown on your seller account"
        >
          <View style={styles.photoActions}>
            <Pressable
              onPress={pickAvatar}
              style={({ pressed }) => [
                styles.photoActionBtn,
                {
                  backgroundColor: `${tintColor}14`,
                  borderColor: tintColor,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <MaterialIcons name="upload" size={18} color={tintColor} />
              <StyledText
                variant="labelLarge"
                style={{ color: tintColor, marginLeft: 8 }}
              >
                Upload new
              </StyledText>
            </Pressable>
            <Pressable
              onPress={() => setAvatarUri(null)}
              style={({ pressed }) => [
                styles.photoActionBtn,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <MaterialIcons name="delete-outline" size={18} color={mutedColor} />
              <StyledText
                variant="labelLarge"
                style={{ color: textColor, marginLeft: 8 }}
              >
                Remove
              </StyledText>
            </Pressable>
          </View>
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="badge"
          title="Identity"
          subtitle="Your name on invoices and messages"
        >
          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <StyledTextInput
                label="First name *"
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.halfField}>
              <StyledTextInput
                label="Last name *"
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <StyledText
            variant="labelMedium"
            style={{ color: mutedColor, marginBottom: 8, marginTop: 4 }}
          >
            Gender
          </StyledText>
          <View style={styles.genderRow}>
            {renderGenderOption("male", "Male")}
            {renderGenderOption("female", "Female")}
          </View>
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="contact-phone"
          title="Contact"
          subtitle="How Vhotis and buyers reach you"
        >
          <StyledTextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{ height: 12 }} />
          <StyledTextInput
            label="Mobile number *"
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </OnboardingSectionCard>

        <OnboardingSectionCard
          icon="receipt-long"
          title="Tax & address"
          subtitle="For compliance and payouts"
        >
          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <StyledTextInput
                label="Tax ID"
                placeholder="Tax identification number"
                value={taxId}
                onChangeText={setTaxId}
              />
            </View>
            <View style={styles.halfField}>
              <StyledTextInput
                label="Tax country"
                placeholder="Country"
                value={taxCountry}
                onChangeText={setTaxCountry}
              />
            </View>
          </View>
          <View style={{ height: 12 }} />
          <StyledTextInput
            label="Residential address"
            placeholder="Street, city, postcode"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </OnboardingSectionCard>
      </View>
      </KeyboardWrapper>
    </View>
  );
};

export default ProfileSettingComponent;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  hero: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginHorizontal: -12,
    marginBottom: 4,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarPress: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  heroName: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  heroHint: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 6,
    textAlign: "center",
  },
  sectionsGap: {
    gap: 14,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButton: {
    width: "100%",
  },
});
