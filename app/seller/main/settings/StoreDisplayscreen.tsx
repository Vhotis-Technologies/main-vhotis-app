import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import AddressAutocompleteInput, {
  type ResolvedAddressPayload,
} from "@/app/component/helpers/forms/AddressAutocompleteInput";
import {
  getPlaceDetails,
  getPlacePredictions,
  parseAddressComponents,
} from "@/app/_utils/places";
import {
  useUpdateStoreDetailsMutation,
  useGetStoreDetailsQuery,
} from "@/app/store/seller/api/storeApi";
import { mergeAuthenticatedUser } from "@/app/store/main/slices/authSlice";
import { store } from "@/app/store/store";
import * as SecureStore from "expo-secure-store";

const REQUIRED_CHECKS = [
  { key: "name", label: "Store name" },
  { key: "description", label: "Description" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "postcode", label: "Postcode" },
  { key: "country", label: "Country" },
] as const;

type StoreAddressFields = {
  line1: string;
  city: string;
  postcode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

const emptyAddressFields = (): StoreAddressFields => ({
  line1: "",
  city: "",
  postcode: "",
  country: "",
  latitude: null,
  longitude: null,
});

function getMutationErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      if (typeof record.error === "string") return record.error;
      if (typeof record.message === "string") return record.message;
      if (typeof record.detail === "string") return record.detail;
    }
  }
  return "Could not save store settings. Please try again.";
}

const StoreDisplayScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{
    storeId?: string | string[];
    storeFocus?: string | string[];
  }>();

  const storeId = useMemo(() => {
    const s = params.storeId;
    if (s == null) return undefined;
    const v = Array.isArray(s) ? s[0] : s;
    return v?.trim() || undefined;
  }, [params.storeId]);

  const { user } = useAppSelector((state) => state.auth);
  const seller = user as Seller;
  const { setAlertConfig, setIsVisible } = useAlertContext();
  const [updateStoreDetails, { isLoading: isSaving }] =
    useUpdateStoreDetailsMutation();
  const { data: storeDetailsData, isLoading: isLoadingStoreDetails } =
    useGetStoreDetailsQuery(storeId ?? "", { skip: !storeId });

  const showAlert = useCallback(
    (title: string, message: string, type: "success" | "error") => {
      setAlertConfig({
        title,
        message,
        type,
        isVisible: true,
        onClose: () => setIsVisible(false),
      });
    },
    [setAlertConfig, setIsVisible],
  );

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");
  const successColor = useThemeColor({}, "success");

  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [addressFields, setAddressFields] =
    useState<StoreAddressFields>(emptyAddressFields);
  const [addressSearchText, setAddressSearchText] = useState("");
  const hydratedRef = useRef<string | null>(null);

  const [weekdayOpen, setWeekdayOpen] = useState("09:00");
  const [weekdayClose, setWeekdayClose] = useState("18:00");
  const [weekendOpen, setWeekendOpen] = useState("10:00");
  const [weekendClose, setWeekendClose] = useState("16:00");
  const [policies, setPolicies] = useState(
    "Returns, shipping rules, and other buyer-facing policies (draft — connect API to save).",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [locationBias, setLocationBias] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const granted =
          status === "granted" ||
          (await Location.requestForegroundPermissionsAsync()).status ===
            "granted";
        if (!granted || cancelled) return;
        const position = await Location.getCurrentPositionAsync({});
        if (!cancelled) {
          setLocationBias({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch {
        /* optional bias */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddressResolved = useCallback((p: ResolvedAddressPayload) => {
    const line1 = p.addressLine1 || "";
    setAddressSearchText(line1);
    setAddressFields({
      line1,
      city: p.city || "",
      postcode: p.postcode || "",
      country: p.country || "",
      latitude:
        p.latitude != null && Number.isFinite(p.latitude) ? p.latitude : null,
      longitude:
        p.longitude != null && Number.isFinite(p.longitude)
          ? p.longitude
          : null,
    });
  }, []);

  useEffect(() => {
    if (storeId) {
      if (isLoadingStoreDetails) return;
      const storeRecord = storeDetailsData?.store;
      if (!storeRecord) {
        setIsLoading(false);
        return;
      }
      const key = `${storeId}:${storeRecord.id}`;
      if (hydratedRef.current === key) return;
      hydratedRef.current = key;

      setBusinessName(storeRecord.business_name || "");
      setBusinessDescription(storeRecord.business_description || "");
      setBusinessPhone(storeRecord.business_phone || seller?.phone || "");
      setAddressFields({
        line1: storeRecord.business_address ?? "",
        city: storeRecord.business_city ?? "",
        postcode: storeRecord.business_zip_code ?? "",
        country: storeRecord.business_country ?? "",
        latitude: storeRecord.latitude ?? null,
        longitude: storeRecord.longitude ?? null,
      });
      setAddressSearchText(storeRecord.business_address ?? "");
      setWeekdayOpen(storeRecord.weekday_open || "09:00");
      setWeekdayClose(storeRecord.weekday_close || "18:00");
      setWeekendOpen(storeRecord.weekend_open || "10:00");
      setWeekendClose(storeRecord.weekend_close || "16:00");
      setIsLoading(false);
      return;
    }

    if (!seller?.user_id) {
      setIsLoading(false);
      return;
    }
    const key = String(seller.user_id);
    if (hydratedRef.current === key) return;
    hydratedRef.current = key;

    setBusinessName(seller.business_name || "");
    setBusinessDescription(seller.business_description || "");
    setBusinessPhone(seller.phone || "");
    setAddressFields({
      line1: seller.address?.address ?? "",
      city: seller.address?.city ?? seller.business_city ?? "",
      postcode: seller.address?.zipCode ?? "",
      country: seller.address?.country ?? "",
      latitude: null,
      longitude: null,
    });
    setAddressSearchText(seller.address?.address ?? "");
    setIsLoading(false);
  }, [
    storeId,
    storeDetailsData,
    isLoadingStoreDetails,
    seller?.user_id,
    seller?.business_name,
    seller?.business_description,
    seller?.phone,
    seller?.address,
    seller?.business_city,
  ]);

  const fieldFilled = useMemo(() => {
    const line1 = addressSearchText.trim() || addressFields.line1.trim();
    return {
      name: Boolean(businessName.trim()),
      description: Boolean(businessDescription.trim()),
      phone: Boolean(businessPhone.trim()),
      address: Boolean(line1),
      city: Boolean(addressFields.city.trim()),
      postcode: Boolean(addressFields.postcode.trim()),
      country: Boolean(addressFields.country.trim()),
    };
  }, [businessName, businessDescription, businessPhone, addressFields, addressSearchText]);

  const completedCount = REQUIRED_CHECKS.filter(
    (item) => fieldFilled[item.key],
  ).length;
  const progress = completedCount / REQUIRED_CHECKS.length;
  const isReady = completedCount === REQUIRED_CHECKS.length;
  const hasGeoPin =
    addressFields.latitude != null && addressFields.longitude != null;

  const resolveAddressFromPlaces = async (
    fields: StoreAddressFields,
    searchText: string,
  ): Promise<StoreAddressFields> => {
    if (
      fields.latitude != null &&
      fields.longitude != null &&
      fields.postcode.trim() &&
      fields.city.trim()
    ) {
      return fields;
    }
    const query = searchText.trim() || fields.line1.trim();
    if (query.length < 3) return fields;

    const predictions = await getPlacePredictions(query, locationBias, 50000);
    const top = predictions[0];
    if (!top?.place_id) return fields;

    const details = await getPlaceDetails(top.place_id);
    if (!details) return fields;

    const parsed = parseAddressComponents(details);
    return {
      line1: parsed.address || fields.line1,
      city: parsed.city || fields.city,
      postcode: parsed.zip_code || fields.postcode,
      country: parsed.country || fields.country,
      latitude: Number.isFinite(parsed.latitude)
        ? parsed.latitude
        : fields.latitude,
      longitude: Number.isFinite(parsed.longitude)
        ? parsed.longitude
        : fields.longitude,
    };
  };

  const handleSave = async () => {
    if (!isReady) {
      showAlert(
        "Missing information",
        "Please complete all required fields before saving.",
        "error",
      );
      return;
    }

    const line1Draft = addressSearchText.trim() || addressFields.line1.trim();

    try {
      const fieldsToSave = await resolveAddressFromPlaces(
        { ...addressFields, line1: line1Draft },
        addressSearchText,
      );

      setAddressFields(fieldsToSave);
      setAddressSearchText(fieldsToSave.line1);

      const response = await updateStoreDetails({
        ...(storeId != null ? { storeId } : {}),
        businessName: businessName.trim(),
        businessDescription: businessDescription.trim(),
        businessAddress: fieldsToSave.line1.trim(),
        businessCity: fieldsToSave.city.trim(),
        businessPostcode: fieldsToSave.postcode.trim(),
        businessCountry: fieldsToSave.country.trim(),
        businessPhone: businessPhone.trim() || undefined,
        ...(fieldsToSave.latitude != null && fieldsToSave.longitude != null
          ? {
              latitude: fieldsToSave.latitude,
              longitude: fieldsToSave.longitude,
            }
          : {}),
        weekdayOpen: weekdayOpen.trim(),
        weekdayClose: weekdayClose.trim(),
        weekendOpen: weekendOpen.trim(),
        weekendClose: weekendClose.trim(),
      }).unwrap();

      if (response.user) {
        const updatedUser = response.user;
        dispatch(mergeAuthenticatedUser(updatedUser));
        setBusinessName(updatedUser.business_name ?? businessName);
        setBusinessDescription(
          updatedUser.business_description ?? businessDescription,
        );
        setBusinessPhone(updatedUser.phone ?? businessPhone);
        setAddressFields({
          line1: updatedUser.address?.address ?? fieldsToSave.line1,
          city:
            updatedUser.address?.city ??
            updatedUser.business_city ??
            fieldsToSave.city,
          postcode: updatedUser.address?.zipCode ?? fieldsToSave.postcode,
          country: updatedUser.address?.country ?? fieldsToSave.country,
          latitude: fieldsToSave.latitude,
          longitude: fieldsToSave.longitude,
        });
        setAddressSearchText(
          updatedUser.address?.address ?? fieldsToSave.line1,
        );
        try {
          const persistedUser = store.getState().auth.user;
          if (persistedUser) {
            await SecureStore.setItemAsync(
              "user",
              JSON.stringify(persistedUser),
            );
          }
        } catch {
          /* non-fatal */
        }
      }

      showAlert(
        "Store settings saved",
        response.message ?? "Your store details were updated successfully.",
        "success",
      );
    } catch (error: unknown) {
      showAlert("Could not save", getMutationErrorMessage(error), "error");
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
            ? "Ready to save changes to your storefront."
            : `${completedCount} of ${REQUIRED_CHECKS.length} required fields completed`}
        </StyledText>
      </View>
      <StyledButton
        title="Save store settings"
        onPress={() => {
          void handleSave();
        }}
        variant="medium"
        disabled={isSaving || !isReady}
        loading={isSaving}
        buttonStyles={styles.submitButton}
      />
    </View>
  );

  if (isLoading || !seller) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 12 }}
        >
          Loading store details…
        </StyledText>
      </View>
    );
  }

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      footer={footer}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.hero, { backgroundColor: cardColor, borderColor }]}>
        <View
          style={[styles.heroIconWrap, { backgroundColor: `${tintColor}18` }]}
        >
          <MaterialIcons name="storefront" size={28} color={tintColor} />
        </View>
        <View style={styles.heroCopy}>
          <StyledText variant="titleMedium" style={{ color: textColor }}>
            {storeId ? "Edit store profile" : "Your storefront"}
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, marginTop: 6, lineHeight: 20 }}
          >
            Update how shoppers see your business — name, location, hours, and
            policies.
          </StyledText>
        </View>
        <View style={styles.tipRow}>
          <View style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}>
            <MaterialIcons name="visibility" size={14} color={tintColor} />
            <StyledText
              variant="labelSmall"
              style={{ color: tintColor, marginLeft: 6 }}
            >
              Buyer-facing
            </StyledText>
          </View>
          <View style={[styles.tipChip, { backgroundColor: `${tintColor}12` }]}>
            <MaterialIcons name="schedule" size={14} color={tintColor} />
            <StyledText
              variant="labelSmall"
              style={{ color: tintColor, marginLeft: 6 }}
            >
              Hours & location
            </StyledText>
          </View>
        </View>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            Profile completeness
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
        subtitle="Name and description on your store page"
      >
        <StyledTextInput
          label="Store name"
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Your business name"
          info="Shown on your storefront and in search"
        />
        <StyledTextInput
          label="Description"
          value={businessDescription}
          onChangeText={setBusinessDescription}
          placeholder="What you sell and what makes your store unique"
          multiline
          numberOfLines={4}
        />
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="contact-phone"
        title="Contact & location"
        subtitle="Phone and address shoppers use"
      >
        <StyledTextInput
          label="Phone"
          value={businessPhone}
          onChangeText={setBusinessPhone}
          keyboardType="phone-pad"
          info="For order updates and support"
        />
        <AddressAutocompleteInput
          label="Address line 1"
          placeholder="Search or type your address"
          info="Pick a suggestion to fill city, postcode, and country"
          value={addressSearchText}
          onChangeText={(text) => {
            setAddressSearchText(text);
            setAddressFields((prev) => ({ ...prev, line1: text }));
          }}
          onAddressResolved={handleAddressResolved}
          locationBias={locationBias}
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
              Address verified on map — coordinates saved for delivery.
            </StyledText>
          </View>
        ) : null}
        <StyledTextInput
          label="City"
          value={addressFields.city}
          onChangeText={(city) =>
            setAddressFields((prev) => ({ ...prev, city }))
          }
          placeholder="City"
        />
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Postcode"
              value={addressFields.postcode}
              onChangeText={(postcode) =>
                setAddressFields((prev) => ({ ...prev, postcode }))
              }
              placeholder="Postal / ZIP"
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Country"
              value={addressFields.country}
              onChangeText={(country) =>
                setAddressFields((prev) => ({ ...prev, country }))
              }
              placeholder="Country"
            />
          </View>
        </View>
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="schedule"
        title="Opening hours"
        subtitle="Shown on your storefront"
      >
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Weekdays open"
              value={weekdayOpen}
              onChangeText={setWeekdayOpen}
              placeholder="09:00"
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Weekdays close"
              value={weekdayClose}
              onChangeText={setWeekdayClose}
              placeholder="18:00"
            />
          </View>
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Weekend open"
              value={weekendOpen}
              onChangeText={setWeekendOpen}
              placeholder="10:00"
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Weekend close"
              value={weekendClose}
              onChangeText={setWeekendClose}
              placeholder="16:00"
            />
          </View>
        </View>
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="description"
        title="Policies"
        subtitle="Returns, shipping, and buyer policies"
      >
        <StyledTextInput
          label="Store policies"
          value={policies}
          onChangeText={setPolicies}
          placeholder="Returns, shipping, support…"
          multiline
          numberOfLines={6}
          info="Draft — full policy save coming soon"
        />
      </OnboardingSectionCard>
    </KeyboardWrapper>
  );
};

export default StoreDisplayScreen;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
