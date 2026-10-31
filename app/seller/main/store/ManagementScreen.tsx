import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useCallback, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect } from "@react-navigation/native";
import { useAlertContext } from "@/app/contexts/AlertContext";
import { router } from "expo-router";
import useSellerStore from "@/app/hook/seller/useSellerStore";
import useSellerAdmin from "@/app/hook/seller/useSellerAdmin";
import { useDeactivateStoreMutation } from "@/app/store/seller/api/storeApi";
import useRequireSellerOwner from "@/app/hook/seller/useRequireSellerOwner";
import { useAppSelector, RootState } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { formatDate } from "@/app/_utils/main/helpers";

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  const textColor = useThemeColor({}, "text");
  const muted = useThemeColor({}, "icons");
  return (
    <View style={styles.sectionHeader}>
      <StyledText variant="titleMedium" style={{ color: textColor }}>
        {title}
      </StyledText>
      <StyledText variant="labelSmall" style={{ color: muted }}>
        {hint}
      </StyledText>
    </View>
  );
}

const ManagementScreen = () => {
  useRequireSellerOwner();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(
    (state: RootState) => state.auth.user,
  ) as Seller | null;
  const teamAllowed = user?.allows_seller_admins === true;

  const {
    sellerStores,
    planLimits,
    activeStoreId,
    setActiveStoreId,
    isLoadingStores,
    canAddStore,
    refetchStores,
  } = useSellerStore({ includeWallet: false, includeLocations: true });

  const {
    admins,
    adminsCount,
    isLoadingAdmins,
    removeAdmin,
    isRemovingAdmin,
    refetchAdmins,
    planLimits: adminPlanLimits,
    canAddAdmin,
  } = useSellerAdmin();

  const { setAlertConfig, setIsVisible } = useAlertContext();
  const [refreshing, setRefreshing] = useState(false);
  const [deactivateStore, { isLoading: isDeactivatingStore }] =
    useDeactivateStoreMutation();

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const iconColor = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error");

  const confirmDeactivateStore = (storeId: string, storeName: string) => {
    setAlertConfig({
      title: "Deactivate location?",
      message: `${storeName} will be closed and hidden from your active locations. Products are kept.`,
      type: "warning",
      isVisible: true,
      onClose: () => setIsVisible(false),
      onConfirm: async () => {
        try {
          await deactivateStore({ storeId }).unwrap();
          await refetchStores();
          if (storeId === activeStoreId) {
            const remaining = sellerStores.filter((s) => s.id !== storeId);
            if (remaining[0]) {
              void setActiveStoreId(remaining[0].id);
            }
          }
          setAlertConfig({
            title: "Location deactivated",
            message: `${storeName} is no longer active.`,
            type: "success",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        } catch (error: unknown) {
          const err = error as { data?: { error?: string; message?: string } };
          setAlertConfig({
            title: "Could not deactivate",
            message:
              err?.data?.error ??
              err?.data?.message ??
              "Please try again later.",
            type: "error",
            isVisible: true,
            onConfirm: () => setIsVisible(false),
          });
        }
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      void refetchStores();
      void refetchAdmins();
    }, [refetchStores, refetchAdmins]),
  );

  const handleAddAdmin = () => {
    router.push("/seller/main/store/CreateAdminScreen");
  };

  const handleRemoveAdmin = (adminId: string, adminName: string) => {
    setAlertConfig({
      title: "Remove team member",
      message: `Remove ${adminName} from your store? They will lose access to manage your locations.`,
      type: "warning",
      isVisible: true,
      onConfirm: async () => {
        setIsVisible(false);
        const result = await removeAdmin(adminId);
        if (result.success) {
          await refetchAdmins();
        }
      },
      onClose: () => setIsVisible(false),
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStores(), refetchAdmins()]);
    setRefreshing(false);
  };

  const isLoading = isLoadingStores || isLoadingAdmins;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 12 }}
        >
          Loading management…
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 28 + insets.bottom },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <StyledText
        variant="bodyMedium"
        style={[styles.intro, { color: iconColor }]}
      >
        Add locations and open a store to manage its link and profile. Manage
        your team below.
      </StyledText>

      {planLimits?.over_store_limit ? (
        <View
          style={[
            styles.limitBanner,
            { backgroundColor: `${tintColor}12`, borderColor: tintColor },
          ]}
        >
          <MaterialIcons name="warning-amber" size={20} color={tintColor} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <StyledText variant="labelMedium" style={{ color: textColor }}>
              Over store location limit
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: iconColor, marginTop: 4 }}
            >
              Your plan allows {planLimits.max_stores} location(s). Extra
              locations were paused after your plan changed.
            </StyledText>
          </View>
          <Pressable
            onPress={() => router.push("/seller/main/store/SubscriptionPlans")}
          >
            <StyledText variant="labelMedium" style={{ color: tintColor }}>
              Upgrade
            </StyledText>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="Store locations"
          hint={
            planLimits
              ? `${planLimits.active_stores}${planLimits.max_stores != null ? ` / ${planLimits.max_stores}` : ""} active`
              : "Your stores"
          }
        />
        <View style={styles.locationsList}>
          {sellerStores.map((store) => {
            const selected = store.id === activeStoreId;
            return (
              <Pressable
                key={store.id}
                onPress={() => {
                  router.push({
                    pathname: "/seller/main/store/StoreDetailsScreen",
                    params: { storeId: store.id },
                  });
                }}
                style={({ pressed }) => [
                  styles.locationCard,
                  {
                    backgroundColor: cardColor,
                    borderColor: selected ? tintColor : borderColor,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <StyledText variant="titleSmall" style={{ color: textColor }}>
                    {store.business_name}
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={{ color: iconColor, marginTop: 2 }}
                  >
                    {[store.business_city, store.business_country]
                      .filter(Boolean)
                      .join(" · ")}
                    {store.product_count != null
                      ? ` · ${store.product_count} products`
                      : ""}
                  </StyledText>
                </View>
                <View style={styles.locationMeta}>
                  <StyledText
                    variant="labelSmall"
                    style={{
                      color: store.status === "open" ? tintColor : iconColor,
                    }}
                  >
                    {store.status === "open" ? "Open" : "Closed"}
                  </StyledText>
                  {selected ? (
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color={tintColor}
                    />
                  ) : (
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={iconColor}
                    />
                  )}
                  {sellerStores.length > 1 ? (
                    <Pressable
                      onPress={() =>
                        confirmDeactivateStore(store.id, store.business_name)
                      }
                      disabled={isDeactivatingStore}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        opacity: pressed || isDeactivatingStore ? 0.6 : 1,
                        marginTop: 4,
                      })}
                    >
                      <StyledText
                        variant="labelSmall"
                        style={{ color: iconColor }}
                      >
                        Deactivate
                      </StyledText>
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {canAddStore ? (
          <Pressable
            onPress={() => router.push("/seller/main/store/CreateStoreScreen")}
            style={({ pressed }) => [
              styles.addLocationButton,
              { borderColor: tintColor, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialIcons name="add-business" size={20} color={tintColor} />
            <StyledText
              variant="labelMedium"
              style={{ color: tintColor, marginLeft: 8 }}
            >
              Add store location
            </StyledText>
          </Pressable>
        ) : planLimits && !planLimits.can_add_store ? (
          <Pressable
            onPress={() => router.push("/seller/main/store/SubscriptionPlans")}
            style={({ pressed }) => [
              styles.addLocationButton,
              { borderColor, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialIcons name="lock" size={18} color={iconColor} />
            <StyledText
              variant="bodySmall"
              style={{ color: iconColor, marginLeft: 8, flex: 1 }}
            >
              Upgrade to add more store locations
            </StyledText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Team members"
          hint={
            teamAllowed
              ? adminPlanLimits?.max_admins != null
                ? `${adminsCount} of ${adminPlanLimits.max_admins} used`
                : `${adminsCount} ${adminsCount === 1 ? "member" : "members"}`
              : "Requires plan upgrade"
          }
        />

        {!teamAllowed ? (
          <View
            style={[
              styles.upgradeCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <MaterialIcons name="lock" size={28} color={iconColor} />
            <StyledText
              variant="titleSmall"
              style={{ color: textColor, marginTop: 12, textAlign: "center" }}
            >
              Team management is not on your plan
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{
                color: iconColor,
                marginTop: 6,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Upgrade to invite team members who can help manage your store
              locations.
            </StyledText>
            <StyledButton
              title="View plans"
              onPress={() => router.push("/seller/main/store/SubscriptionPlans")}
              style={{ marginTop: 16, minWidth: 180 }}
            />
          </View>
        ) : (
          <>
            {adminPlanLimits?.over_admin_limit ? (
              <View
                style={[
                  styles.limitBanner,
                  { borderColor, backgroundColor: cardColor },
                ]}
              >
                <MaterialIcons
                  name="warning-amber"
                  size={20}
                  color={errorColor}
                />
                <StyledText
                  variant="bodySmall"
                  style={{ color: textColor, flex: 1, marginLeft: 8 }}
                >
                  Your plan allows {adminPlanLimits.max_admins} team member(s).
                  Extra members were deactivated after your plan changed.
                </StyledText>
              </View>
            ) : null}

            <View style={styles.teamActions}>
              <StyledButton
                title={canAddAdmin ? "Add team member" : "Team limit reached"}
                onPress={handleAddAdmin}
                variant="medium"
                buttonStyles={styles.teamActionButton}
                disabled={!canAddAdmin}
              />
              {!canAddAdmin ? (
                <StyledButton
                  title="View plans"
                  onPress={() =>
                    router.push("/seller/main/store/SubscriptionPlans")
                  }
                  variant="medium"
                  buttonStyles={styles.teamActionButton}
                />
              ) : null}
            </View>

            {admins.length === 0 ? (
              <View style={styles.emptyTeam}>
                <MaterialIcons name="groups" size={48} color={iconColor} />
                <StyledText
                  variant="titleSmall"
                  style={{ color: textColor, marginTop: 10 }}
                >
                  No team members yet
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={{
                    color: iconColor,
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Invite someone to help manage orders, catalog, and store
                  settings.
                </StyledText>
              </View>
            ) : (
              <View style={styles.adminsList}>
                {admins.map((admin) => (
                  <View
                    key={admin.id}
                    style={[
                      styles.adminCard,
                      { backgroundColor: cardColor, borderColor },
                    ]}
                  >
                    <View style={styles.adminCardHeader}>
                      <View style={styles.adminInfo}>
                        <View
                          style={[
                            styles.adminAvatar,
                            { backgroundColor: `${tintColor}12` },
                          ]}
                        >
                          <MaterialIcons
                            name="person"
                            size={24}
                            color={iconColor}
                          />
                        </View>
                        <View style={styles.adminDetails}>
                          <StyledText
                            variant="titleSmall"
                            style={{ color: textColor }}
                          >
                            {admin.first_name} {admin.last_name}
                          </StyledText>
                          <StyledText
                            variant="bodySmall"
                            style={{ color: iconColor, marginTop: 2 }}
                          >
                            {admin.email}
                          </StyledText>
                          {admin.phone ? (
                            <StyledText
                              variant="bodySmall"
                              style={{ color: iconColor, marginTop: 2 }}
                            >
                              {admin.phone}
                            </StyledText>
                          ) : null}
                        </View>
                      </View>
                      <Pressable
                        onPress={() =>
                          handleRemoveAdmin(
                            admin.id,
                            `${admin.first_name} ${admin.last_name}`,
                          )
                        }
                        disabled={isRemovingAdmin}
                        style={styles.removeButton}
                      >
                        {isRemovingAdmin ? (
                          <ActivityIndicator size="small" color={errorColor} />
                        ) : (
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color={errorColor}
                          />
                        )}
                      </Pressable>
                    </View>

                    {admin.stores && admin.stores.length > 0 ? (
                      <View
                        style={[
                          styles.storesContainer,
                          { borderTopColor: borderColor },
                        ]}
                      >
                        <StyledText
                          variant="labelMedium"
                          style={{ color: iconColor, marginBottom: 6 }}
                        >
                          Store access
                        </StyledText>
                        {admin.stores.map((store) => (
                          <View
                            key={store.id}
                            style={[
                              styles.storeTag,
                              { backgroundColor, borderColor },
                            ]}
                          >
                            <MaterialIcons
                              name="store"
                              size={14}
                              color={iconColor}
                            />
                            <StyledText
                              variant="bodySmall"
                              style={{ color: textColor }}
                            >
                              {store.business_name}
                            </StyledText>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.dateContainer,
                        { borderTopColor: borderColor },
                      ]}
                    >
                      <MaterialIcons
                        name="calendar-today"
                        size={14}
                        color={iconColor}
                      />
                      <StyledText
                        variant="bodySmall"
                        style={{ color: iconColor, marginLeft: 6 }}
                      >
                        Added {formatDate(admin.created_at)}
                      </StyledText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  intro: {
    lineHeight: 22,
    marginBottom: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    marginBottom: 12,
    gap: 2,
  },
  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  locationsList: {
    gap: 10,
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  locationMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  upgradeCard: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 24,
  },
  teamActions: {
    gap: 10,
    marginBottom: 16,
  },
  teamActionButton: {
    width: "100%",
  },
  emptyTeam: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  adminsList: {
    gap: 12,
  },
  adminCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  adminCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  adminInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  adminDetails: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  storesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  storeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
