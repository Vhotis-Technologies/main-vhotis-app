import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import AddressAutocompleteInput, {
  type ResolvedAddressPayload,
} from "@/app/component/helpers/forms/AddressAutocompleteInput";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateStoreMutation } from "@/app/store/seller/api/storeApi";
import { useSnackbar } from "@/app/contexts/SnackbarContext";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";

const REQUIRED_CHECKS = [
  { key: "name", label: "Store name" },
  { key: "description", label: "Description" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "postcode", label: "Postcode" },
  { key: "country", label: "Country" },
  { key: "phone", label: "Phone" },
] as const;

const CreateStoreScreen = () => {
  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const { showSnackbarWithConfig } = useSnackbar();
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");

  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessPostcode, setBusinessPostcode] = useState("");
  const [businessCountry, setBusinessCountry] = useState(
    user?.address?.country ?? "",
  );
  const [businessPhone, setBusinessPhone] = useState(user?.phone ?? "");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fieldFilled = useMemo(
    () => ({
      name: Boolean(businessName.trim()),
      description: Boolean(businessDescription.trim()),
      address: Boolean(businessAddress.trim()),
      city: Boolean(businessCity.trim()),
      postcode: Boolean(businessPostcode.trim()),
      country: Boolean(businessCountry.trim()),
      phone: Boolean(businessPhone.trim()),
    }),
    [
      businessName,
      businessDescription,
      businessAddress,
      businessCity,
      businessPostcode,
      businessCountry,
      businessPhone,
    ],
  );

  const completedCount = REQUIRED_CHECKS.filter(
    (item) => fieldFilled[item.key],
  ).length;
  const progress = completedCount / REQUIRED_CHECKS.length;
  const isReady = completedCount === REQUIRED_CHECKS.length;
  const hasGeoPin = latitude != null && longitude != null;

  const onAddressResolved = useCallback((payload: ResolvedAddressPayload) => {
    setBusinessAddress(payload.addressLine1 ?? "");
    setBusinessCity(payload.city ?? "");
    setBusinessPostcode(payload.postcode ?? "");
    setBusinessCountry(payload.country ?? "");
    setLatitude(payload.latitude ?? null);
    setLongitude(payload.longitude ?? null);
  }, []);

  const handleSubmit = async () => {
    if (!isReady) {
      showSnackbarWithConfig({
        message: "Please complete all required fields.",
        type: "error",
        duration: 3500,
      });
      return;
    }

    try {
      await createStore({
        businessName: businessName.trim(),
        businessDescription: businessDescription.trim(),
        businessAddress: businessAddress.trim(),
        businessCity: businessCity.trim(),
        businessPostcode: businessPostcode.trim(),
        businessCountry: businessCountry.trim(),
        businessPhone: businessPhone.trim(),
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      }).unwrap();

      showSnackbarWithConfig({
        message: "New store location created.",
        type: "success",
        duration: 3000,
      });
      router.back();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      showSnackbarWithConfig({
        message: err?.data?.error ?? "Could not create store location.",
        type: "error",
        duration: 4000,
      });
    }
  };

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
          color={isReady ? successColor : iconMuted}
        />
        <StyledText
          variant="bodySmall"
          style={{ color: iconMuted, flex: 1, marginLeft: 8 }}
        >
          {isReady
            ? "All required details are complete. You can create this location now."
            : `${completedCount} of ${REQUIRED_CHECKS.length} required fields completed`}
        </StyledText>
      </View>
      <StyledButton
        title="Create location"
        onPress={() => {
          void handleSubmit();
        }}
        loading={isLoading}
        disabled={isLoading || !isReady}
        variant="medium"
        buttonStyles={styles.submitButton}
      />
    </View>
  );

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      footer={footer}
      contentContainerStyle={styles.scrollContent}
    >
      <View
        style={[
          styles.hero,
          { backgroundColor: cardColor, borderColor },
        ]}
      >
        <View
          style={[styles.heroIconWrap, { backgroundColor: `${tintColor}18` }]}
        >
          <MaterialIcons name="add-business" size={28} color={tintColor} />
        </View>
        <View style={styles.heroCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            Open a new location
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, marginTop: 6, lineHeight: 20 }}
          >
            Each location gets its own catalog, orders, and settings. Shoppers
            pick the store closest to them.
          </StyledText>
        </View>
        <View style={styles.tipRow}>
          <View
            style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}
          >
            <MaterialIcons name="inventory-2" size={14} color={tintColor} />
            <StyledText
              variant="labelSmall"
              style={{ color: tintColor, marginLeft: 6 }}
            >
              Own catalog
            </StyledText>
          </View>
          <View
            style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}
          >
            <MaterialIcons name="groups" size={14} color={tintColor} />
            <StyledText
              variant="labelSmall"
              style={{ color: tintColor, marginLeft: 6 }}
            >
              Team access
            </StyledText>
          </View>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            Setup progress
          </StyledText>
          <StyledText variant="labelSmall" style={{ color: tintColor }}>
            {Math.round(progress * 100)}%
          </StyledText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: tintColor,
                width: `${Math.max(progress * 100, 4)}%`,
              },
            ]}
          />
        </View>
        <View style={styles.checklist}>
          {REQUIRED_CHECKS.map((item) => {
            const done = fieldFilled[item.key];
            return (
              <View key={item.key} style={styles.checkItem}>
                <MaterialIcons
                  name={done ? "check-circle" : "radio-button-unchecked"}
                  size={16}
                  color={done ? successColor : iconMuted}
                />
                <StyledText
                  variant="labelSmall"
                  style={{
                    color: done ? textColor : iconMuted,
                    marginLeft: 6,
                  }}
                >
                  {item.label}
                </StyledText>
              </View>
            );
          })}
        </View>
      </View>

      <OnboardingSectionCard
        icon="storefront"
        title="Store identity"
        subtitle="How this location appears to shoppers"
      >
        <StyledTextInput
          label="Business name"
          placeholder="e.g. Vhot Dublin"
          info="Shown on your storefront and in search"
          value={businessName}
          onChangeText={setBusinessName}
        />
        <StyledTextInput
          label="Description"
          placeholder="What does this location specialise in?"
          info="A short pitch for customers browsing your store"
          value={businessDescription}
          onChangeText={setBusinessDescription}
          multiline
          numberOfLines={4}
        />
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="pin-drop"
        title="Location"
        subtitle="Address shoppers and delivery use"
      >
        <AddressAutocompleteInput
          label="Street address"
          placeholder="Search or type your address"
          value={businessAddress}
          onChangeText={setBusinessAddress}
          onAddressResolved={onAddressResolved}
        />

        {hasGeoPin ? (
          <View
            style={[
              styles.geoBadge,
              { backgroundColor: `${successColor}14`, borderColor: successColor },
            ]}
          >
            <MaterialIcons name="my-location" size={16} color={successColor} />
            <StyledText
              variant="labelSmall"
              style={{ color: successColor, marginLeft: 8, flex: 1 }}
            >
              Address verified on map — coordinates saved for delivery zones.
            </StyledText>
          </View>
        ) : null}

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="City"
              placeholder="Dublin"
              value={businessCity}
              onChangeText={setBusinessCity}
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Postcode"
              placeholder="D02 X285"
              value={businessPostcode}
              onChangeText={setBusinessPostcode}
            />
          </View>
        </View>
        <StyledTextInput
          label="Country"
          placeholder="Ireland"
          value={businessCountry}
          onChangeText={setBusinessCountry}
        />
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="contact-phone"
        title="Contact"
        subtitle="Phone number for this location"
      >
        <StyledTextInput
          label="Phone"
          placeholder="Business phone"
          value={businessPhone}
          onChangeText={setBusinessPhone}
          keyboardType="phone-pad"
          info="Used for order updates and support at this location"
        />
      </OnboardingSectionCard>
    </KeyboardWrapper>
  );
};

export default CreateStoreScreen;

const styles = StyleSheet.create({
  scrollContent: {
    gap: 14,
    paddingBottom: 12,
  },
  hero: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    gap: 2,
  },
  tipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  progressBlock: {
    gap: 10,
    paddingHorizontal: 2,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  checklist: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  geoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
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
