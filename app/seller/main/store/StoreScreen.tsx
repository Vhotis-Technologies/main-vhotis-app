import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootState, useAppSelector } from "@/app/store/store";
import { Seller, isStoreAdminUser } from "@/app/interfaces/main/Authentication";
import useSellerStore, {
  STORE_CATALOG_TILES,
  getStoreConfigTiles,
  getStoreMonetizeTiles,
  STORE_H_PAD,
  STORE_INSIGHT_TILES,
  STORE_RELATION_TILES,
  STORE_TILE_GAP,
  STORE_TILE_WIDTH,
  STORE_WALLET_METRICS,
  navigateStoreHub,
  type StoreHubTile,
} from "@/app/hook/seller/useSellerStore";
import useStoreFront from "@/app/hook/main/useStoreFinances";
import CustomSwitchComponent from "@/app/component/helpers/others/CustomSwitchComponent";
import FulfillmentStoreHubCard from "@/app/component/seller/store/FulfillmentStoreHubCard";

const StoreScreen = () => {
  const insets = useSafeAreaInsets();
  const { isStoreOpen } = useAppSelector((s: RootState) => s.store);
  const user = useAppSelector((s: RootState) => s.auth.user) as Seller | null;
  const isStoreAdmin = isStoreAdminUser(user);
  const {
    toggleStoreOpen,
    isUpdatingStore,
    wallet,
    isFetchingWallet,
    refetchWallet,
    displayName,
    avatarLabel,
    walletCurrency,
    availableBalance,
    formatWalletValue,
    sellerStores,
    activeStoreId,
    activeStore,
    isOwner,
  } = useSellerStore({
    includeWallet: !isStoreAdminUser(user),
    includeLocations: true,
  });
  const configTiles = getStoreConfigTiles(user, activeStoreId);
  const monetizeTiles = getStoreMonetizeTiles(user);
  const { openFinancialAnalytics, isCheckingFinancialAccess } =
    useStoreFront(undefined);

  const isFulfillmentMode =
    user?.operating_mode === "fulfillment" ||
    user?.is_virtual_store ||
    Boolean(activeStore?.is_virtual);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");

  const renderTile = (tile: StoreHubTile) => (
    <Pressable
      key={tile.key}
      onPress={() => navigateStoreHub(tile.route)}
      style={({ pressed }) => [
        styles.tile,
        {
          width: STORE_TILE_WIDTH,
          backgroundColor: cardColor,
          borderColor,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={[styles.tileIconWrap, { backgroundColor: `${tintColor}18` }]}
      >
        <MaterialIcons name={tile.icon} size={22} color={tintColor} />
      </View>
      <StyledText
        variant="titleSmall"
        style={{ color: textColor }}
        numberOfLines={1}
      >
        {tile.title}
      </StyledText>
      <StyledText
        variant="bodySmall"
        numberOfLines={1}
        style={{ color: iconMuted, marginTop: 2 }}
      >
        {tile.subtitle}
      </StyledText>
    </Pressable>
  );

  const renderRow = (tiles: StoreHubTile[]) => (
    <View style={styles.tileRow}>{tiles.map(renderTile)}</View>
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 28 + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.hero,
          {
            paddingTop: 10,
            paddingBottom: isStoreAdmin ? 16 : 54,
          },
        ]}
      >
        <View style={styles.heroTopBar}>
          <View style={styles.identityRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${tintColor}18`, borderColor: tintColor },
              ]}
            >
              <StyledText
                variant="labelLarge"
                style={[styles.avatarText, { color: tintColor }]}
              >
                {avatarLabel}
              </StyledText>
            </View>
            <View style={styles.identityCopy}>
              <StyledText variant="labelMedium" style={{ color: iconMuted }}>
                {isStoreAdmin ? "Your store" : "Store wallet"}
              </StyledText>
              <StyledText
                variant="titleMedium"
                style={[styles.heroTitle, { color: textColor }]}
                numberOfLines={1}
              >
                Hello, {displayName}
              </StyledText>
            </View>
          </View>
          {!isStoreAdmin ? (
            <Pressable
              onPress={() => refetchWallet()}
              style={({ pressed }) => [
                styles.heroIconButton,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  opacity: pressed ? 0.76 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Refresh wallet balance"
            >
              {isFetchingWallet ? (
                <ActivityIndicator size="small" color={tintColor} />
              ) : (
                <MaterialIcons name="refresh" size={20} color={textColor} />
              )}
            </Pressable>
          ) : null}
        </View>

        {!isStoreAdmin ? (
          <View
            style={[
              styles.walletCard,
              { backgroundColor: cardColor, borderColor },
            ]}
          >
            <View
              style={[styles.walletArcLarge, { borderColor: `${tintColor}20` }]}
            />
            <View
              style={[styles.walletArcSmall, { borderColor: `${tintColor}18` }]}
            />
            <View style={styles.walletHeader}>
              <View style={styles.walletHeaderLeft}>
                <View
                  style={[
                    styles.walletIconBadge,
                    { backgroundColor: `${tintColor}18` },
                  ]}
                >
                  <MaterialIcons name="payments" size={20} color={tintColor} />
                </View>
                <View>
                  <StyledText
                    variant="labelLarge"
                    style={[styles.walletLabel, { color: textColor }]}
                  >
                    Wallet Balance
                  </StyledText>
                  <StyledText
                    variant="bodySmall"
                    style={[styles.walletHelper, { color: iconMuted }]}
                  >
                    Ready for payout
                  </StyledText>
                </View>
              </View>
              <View
                style={[
                  styles.walletCurrencyPill,
                  { backgroundColor: `${tintColor}18`, borderColor: tintColor },
                ]}
              >
                <StyledText
                  variant="labelSmall"
                  style={[styles.walletCurrencyText, { color: tintColor }]}
                >
                  {walletCurrency}
                </StyledText>
              </View>
            </View>

            <StyledText
              variant="displaySmall"
              style={[styles.walletAmount, { color: textColor }]}
            >
              {availableBalance}
            </StyledText>

            <View style={styles.walletMetricGrid}>
              {STORE_WALLET_METRICS.map((metric) => (
                <View
                  key={metric.key}
                  style={[
                    styles.walletMetric,
                    { backgroundColor: `${tintColor}0D`, borderColor },
                  ]}
                >
                  <View
                    style={[
                      styles.walletMetricIcon,
                      { backgroundColor: `${tintColor}18` },
                    ]}
                  >
                    <MaterialIcons
                      name={metric.icon}
                      size={16}
                      color={tintColor}
                    />
                  </View>
                  <StyledText
                    variant="labelSmall"
                    style={[styles.walletMetricLabel, { color: iconMuted }]}
                    numberOfLines={1}
                  >
                    {metric.label}
                  </StyledText>
                  <StyledText
                    variant="titleSmall"
                    style={[styles.walletMetricValue, { color: textColor }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {isFetchingWallet && !wallet
                      ? "—"
                      : formatWalletValue(wallet?.[metric.key])}
                  </StyledText>
                  <StyledText
                    variant="labelSmall"
                    style={[styles.walletMetricHelper, { color: iconMuted }]}
                  >
                    {metric.helper}
                  </StyledText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <StyledText
          variant="bodyMedium"
          style={[
            styles.heroSubtitle,
            { color: iconMuted, marginTop: isStoreAdmin ? 0 : 10 },
          ]}
        >
          {isStoreAdmin
            ? "Manage catalog, orders, and how shoppers see your location."
            : isOwner && sellerStores.length > 1
              ? `Managing ${activeStore?.business_name ?? "your store"}. Switch locations in Management.`
              : "One place for catalog, insights, billing, and how shoppers see you."}
        </StyledText>
      </View>

      {!isFulfillmentMode ? (
      <View
        style={[
          styles.floatingCard,
          { backgroundColor: cardColor, borderColor },
          isStoreAdmin
            ? styles.floatingCardAfterStoreAdmin
            : styles.floatingCardAfterHero,
        ]}
      >
        <View style={styles.statusRow}>
          <View style={styles.statusCopy}>
            <StyledText variant="titleSmall" style={{ color: textColor }}>
              {isStoreOpen ? "Store is live" : "Store is paused"}
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, marginTop: 4 }}
            >
              {isOwner && activeStore
                ? `Applies to ${activeStore.business_name}. `
                : ""}
              {isStoreOpen
                ? "New orders can come in. Close when you need a break."
                : "Shoppers see you as closed; toggle on when you are ready."}
            </StyledText>
          </View>
          <CustomSwitchComponent
            isOn={isStoreOpen}
            onToggle={() => {
              void toggleStoreOpen();
            }}
            onText="OPEN"
            offText="CLOSED"
            isLoading={isUpdatingStore}
          />
        </View>
      </View>
      ) : null}

      {isOwner ? (
        <View style={styles.section}>
          <SectionHeader
            title={isFulfillmentMode ? "Fulfillment" : "Fulfillment"}
            hint={isFulfillmentMode ? "Your warehouse program" : "Vhotis-managed warehousing"}
          />
          <FulfillmentStoreHubCard />
        </View>
      ) : null}

      {monetizeTiles.length ? (
        <View style={styles.section}>
          <SectionHeader title="Monetize" hint="Plans & receipts" />
          {renderRow(monetizeTiles)}
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Catalog & Campaigns" hint="Daily ops" />
        {renderRow(STORE_CATALOG_TILES.slice(0, 2))}
        {renderRow(STORE_CATALOG_TILES.slice(2, 4))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Insights" hint="Analytics" />
        {renderRow(STORE_INSIGHT_TILES.slice(0, 2))}
        {STORE_INSIGHT_TILES.length > 2
          ? renderRow(STORE_INSIGHT_TILES.slice(2, 3))
          : null}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Customers" hint="Reputation" />
        {renderRow(STORE_RELATION_TILES)}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Configuration" hint="Policies & tools" />
        {renderRow(configTiles.slice(0, 2))}
        {configTiles.length > 2 ? renderRow(configTiles.slice(2, 4)) : null}
      </View>

      {!isStoreAdmin ? (
        <View style={styles.section}>
          <SectionHeader title="Finance" hint="Balances & performance" />
          <Pressable
            onPress={openFinancialAnalytics}
            disabled={isCheckingFinancialAccess}
            style={({ pressed }) => [
              styles.financialAnalyticTile,
              {
                backgroundColor: cardColor,
                borderColor,
                opacity: pressed || isCheckingFinancialAccess ? 0.9 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.financialAnalyticIcon,
                { backgroundColor: `${tintColor}18` },
              ]}
            >
              <MaterialIcons name="analytics" size={22} color={tintColor} />
            </View>
            <View style={styles.financialAnalyticCopy}>
              <StyledText variant="titleSmall" style={{ color: textColor }}>
                Financial analytics
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: iconMuted, marginTop: 3 }}
              >
                Review your financial performance and insights.
              </StyledText>
            </View>
            {isCheckingFinancialAccess ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <MaterialIcons name="chevron-right" size={24} color={iconMuted} />
            )}
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
};

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

export default StoreScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: STORE_H_PAD,
  },
  hero: {
    marginHorizontal: -STORE_H_PAD,
    paddingHorizontal: STORE_H_PAD,
    paddingBottom: 54,
    borderRadius: 20,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  identityRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  identityCopy: {
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarText: {
    fontFamily: "RobotoBold",
  },
  heroIconButton: {
    width: 42,
    height: 42,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroTitle: {
    fontFamily: "RobotoBold",
  },
  heroSubtitle: {
    marginTop: 10,
    lineHeight: 22,
    alignSelf: "stretch",
  },
  walletCard: {
    overflow: "hidden",
    padding: 16,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    zIndex: 1,
  },
  walletHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  walletIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  walletLabel: {
    letterSpacing: 0.3,
  },
  walletHelper: {
    marginTop: 1,
  },
  walletCurrencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  walletCurrencyText: {
    fontFamily: "RobotoBold",
    letterSpacing: 0.8,
  },
  walletAmount: {
    fontFamily: "RobotoBold",
    marginBottom: 16,
    zIndex: 1,
  },
  walletMetricGrid: {
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
  },
  walletMetric: {
    flex: 1,
    minHeight: 104,
    borderRadius: 20,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  walletMetricIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  walletMetricLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  walletMetricValue: {
    marginTop: 3,
    fontFamily: "RobotoBold",
  },
  walletMetricHelper: {
    marginTop: 2,
  },
  walletArcLarge: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    top: -86,
    left: -70,
  },
  walletArcSmall: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    right: -80,
    bottom: -82,
  },
  floatingCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  floatingCardAfterHero: {
    marginTop: -36,
  },
  floatingCardAfterStoreAdmin: {
    marginTop: 0,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusCopy: {
    flex: 1,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    marginBottom: 12,
    gap: 2,
  },
  tileRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: STORE_TILE_GAP,
    marginBottom: 8,
  },
  tile: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    minHeight: 108,
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  financialAnalyticTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    minHeight: 92,
  },
  financialAnalyticIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  financialAnalyticCopy: {
    flex: 1,
  },
});
