import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { useAppSelector } from "@/app/store/store";
import {
  Seller,
  isStoreAdminUser,
} from "@/app/interfaces/main/Authentication";
import {
  useGetStoreDetailsQuery,
  useUpdateStoreDetailsMutation,
} from "@/app/store/seller/api/storeApi";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import { allowsPublicStorefrontUrl } from "@/app/_utils/seller/storefrontShare";
import { buildStoreShareUrl } from "@/app/_utils/main/shareLinks";
import { shareStoreLink } from "@/app/_utils/main/shareActions";

function getMutationErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      if (typeof record.error === "string") return record.error;
    }
  }
  return "Could not save. Please try again.";
}

const StoreDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ storeId?: string | string[] }>();
  const storeId = useMemo(() => {
    const raw = params.storeId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() || undefined;
  }, [params.storeId]);

  const user = useAppSelector((state) => state.auth.user) as Seller;
  const isStoreAdmin = isStoreAdminUser(user);
  const isOwner = Boolean(user?.is_seller && !isStoreAdmin);

  const { activeStoreId, setActiveStoreId, sellerStores } = useSellerStore({
    includeLocations: true,
  });

  const { setAlertConfig, setIsVisible } = useAlertContext();
  const { data, isLoading } = useGetStoreDetailsQuery(storeId ?? "", {
    skip: !storeId,
  });
  const [updateStoreDetails, { isLoading: isSavingSlug }] =
    useUpdateStoreDetailsMutation();

  const [storeSlug, setStoreSlug] = useState("");

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");

  const store = data?.store;
  const canManagePublicUrl = allowsPublicStorefrontUrl(user);
  const normalizedSlug = storeSlug.trim().toLowerCase();
  const isActiveStore = storeId != null && storeId === activeStoreId;

  useEffect(() => {
    if (store?.slug != null) {
      setStoreSlug(store.slug || "");
    }
  }, [store?.slug, store?.id]);

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

  const handleSaveSlug = async () => {
    if (!storeId || !store) return;
    try {
      await updateStoreDetails({
        storeId,
        businessName: store.business_name,
        businessDescription: store.business_description,
        businessAddress: store.business_address,
        businessCity: store.business_city,
        businessPostcode: store.business_zip_code,
        businessCountry: store.business_country,
        businessPhone: store.business_phone,
        weekdayOpen: store.weekday_open || undefined,
        weekdayClose: store.weekday_close || undefined,
        weekendOpen: store.weekend_open || undefined,
        weekendClose: store.weekend_close || undefined,
        storeSlug: normalizedSlug,
      }).unwrap();
      showAlert("Link saved", "Your public store URL slug was updated.", "success");
    } catch (error: unknown) {
      showAlert("Could not save", getMutationErrorMessage(error), "error");
    }
  };

  if (!storeId) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          No store selected.
        </StyledText>
      </View>
    );
  }

  if (isLoading || !store) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText variant="bodyMedium" style={{ color: textColor, marginTop: 12 }}>
          Loading store details…
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 24 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: cardColor, borderColor }]}>
        <View style={[styles.heroIcon, { backgroundColor: `${tintColor}18` }]}>
          <MaterialIcons name="storefront" size={28} color={tintColor} />
        </View>
        <StyledText variant="titleLarge" style={{ color: textColor }}>
          {store.business_name}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
          {[store.business_city, store.business_country].filter(Boolean).join(" · ")}
        </StyledText>
        <View style={styles.heroMeta}>
          <View style={[styles.statusChip, { borderColor }]}>
            <StyledText variant="labelSmall" style={{ color: textColor }}>
              {store.status === "open" ? "Open" : "Closed"}
            </StyledText>
          </View>
          {isActiveStore ? (
            <View style={[styles.activeChip, { backgroundColor: `${tintColor}18` }]}>
              <MaterialIcons name="check-circle" size={14} color={tintColor} />
              <StyledText variant="labelSmall" style={{ color: tintColor, marginLeft: 4 }}>
                Active store
              </StyledText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isOwner && sellerStores.length > 1 && !isActiveStore ? (
          <StyledButton
            title="Set as active store"
            variant="medium"
            onPress={() => {
              void setActiveStoreId(storeId);
            }}
            buttonStyles={styles.actionBtn}
          />
        ) : null}
        <StyledButton
          title="Edit store profile"
          variant="medium"
          onPress={() => {
            router.push({
              pathname: "/seller/main/settings/StoreDisplayscreen",
              params: { storeId },
            });
          }}
          buttonStyles={styles.actionBtn}
        />
      </View>

      {isOwner && canManagePublicUrl ? (
        <OnboardingSectionCard
          icon="link"
          title="Public store link"
          subtitle="Enterprise Plus — share your storefront on the web"
        >
          <StyledTextInput
            label="Store URL slug"
            value={storeSlug}
            onChangeText={(text) => setStoreSlug(text.toLowerCase())}
            placeholder="my-store-name"
            autoCapitalize="none"
            autoCorrect={false}
            info="Lowercase letters, numbers, and hyphens only."
          />
          {normalizedSlug ? (
            <View
              style={[
                styles.slugPreview,
                { borderColor, backgroundColor: `${tintColor}10` },
              ]}
            >
              <MaterialIcons name="link" size={16} color={tintColor} />
              <StyledText
                variant="labelSmall"
                style={{ color: textColor, marginLeft: 8, flex: 1 }}
                numberOfLines={2}
              >
                {buildStoreShareUrl(normalizedSlug)}
              </StyledText>
            </View>
          ) : null}
          <View style={styles.slugActions}>
            <StyledButton
              title="Save slug"
              onPress={() => {
                void handleSaveSlug();
              }}
              variant="medium"
              loading={isSavingSlug}
              disabled={isSavingSlug}
              buttonStyles={styles.slugBtn}
            />
            {normalizedSlug ? (
              <StyledButton
                title="Share store link"
                onPress={() => {
                  void shareStoreLink(
                    normalizedSlug,
                    store.business_name || undefined,
                  );
                }}
                variant="medium"
                buttonStyles={styles.slugBtn}
              />
            ) : null}
          </View>
        </OnboardingSectionCard>
      ) : null}
    </ScrollView>
  );
};

export default StoreDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actionsRow: { gap: 10 },
  actionBtn: { width: "100%" },
  slugPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  slugActions: { gap: 10 },
  slugBtn: { width: "100%" },
});
