import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import MobilePromotionHistoryComponent from "@/app/component/seller/promotions/MobilePromotionHistoryComponent";
import CampaignHistoryHero from "@/app/component/seller/shared/CampaignHistoryHero";
import { PromotionHistoryInterface } from "@/app/interfaces/seller/PromotionsInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useGetPromotionHistoryQuery } from "@/app/store/seller/api/promotionApi";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";
import {
  CampaignHistorySection,
  groupCampaignsByStatus,
  summarizeCampaigns,
} from "@/app/utils/campaignHistory";
import { formatCurrency } from "@/app/_utils/main/helpers";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

const DEAL_ACCENT_FALLBACK = "#0E7490";

const PromotionHistoryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");

  const accent = buttonColor || DEAL_ACCENT_FALLBACK;
  const storeId = useCampaignHistoryStoreId();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: promotions = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPromotionHistoryQuery(storeId);

  const summary = useMemo(() => summarizeCampaigns(promotions), [promotions]);
  const sections = useMemo(
    () => groupCampaignsByStatus(promotions),
    [promotions],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderHero = () => (
    <CampaignHistoryHero
      accent={accent}
      cardColor={cardColor}
      statTextColor={textColor}
      icon="local-offer"
      title={
        summary.total > 0
          ? `${summary.total} discount campaign${summary.total === 1 ? "" : "s"}`
          : "No deals yet"
      }
      subtitle={
        summary.total > 0
          ? "Percentage, fixed, BOGO, and bundle campaigns for your store"
          : "Run your first deal to track reach and sales here"
      }
      stats={
        summary.total > 0
          ? [
              { label: "Active", value: String(summary.active) },
              { label: "Scheduled", value: String(summary.scheduled) },
              {
                label: "Sales",
                value: formatCurrency(summary.totalSales),
              },
            ]
          : []
      }
    />
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: CampaignHistorySection;
  }) => (
    <View style={[styles.sectionHeader, { backgroundColor }]}>
      <StyledText variant="labelLarge" style={{ color: textColor, fontWeight: "700" }}>
        {section.title}
      </StyledText>
      <View style={[styles.sectionBadge, { backgroundColor: `${accent}20` }]}>
        <StyledText variant="labelSmall" style={{ color: accent, fontWeight: "700" }}>
          {section.data.length}
        </StyledText>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: PromotionHistoryInterface }) => (
    <MobilePromotionHistoryComponent promotion={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrap,
          { backgroundColor: `${accent}14`, borderColor: `${accent}35` },
        ]}
      >
        <MaterialIcons name="sell" size={40} color={accent} />
      </View>
      <StyledText
        variant="titleSmall"
        style={{ color: textColor, marginTop: 16, textAlign: "center" }}
      >
        {isError ? "Couldn't load deal history" : "No deals yet"}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={{
          color: mutedColor,
          marginTop: 8,
          textAlign: "center",
          lineHeight: 20,
          paddingHorizontal: 24,
        }}
      >
        {isError
          ? "Pull down to refresh and try again."
          : "Create percentage, fixed, BOGO, or bundle campaigns from Promotions."}
      </StyledText>
      {!isError ? (
        <StyledButton
          title="Create a deal"
          onPress={() => router.push("/seller/main/promotions/PromotionsScreen")}
          variant="medium"
          buttonStyles={{ marginTop: 20, width: "100%", maxWidth: 280 }}
        />
      ) : null}
    </View>
  );

  if (isLoading && promotions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accent} />
          <StyledText variant="bodyMedium" style={{ color: mutedColor, marginTop: 12 }}>
            Loading deal history...
          </StyledText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) =>
          `${item.storeId ?? "store"}-deal-${item.type}-${item.id}`
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHero}
        ListEmptyComponent={renderEmpty}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={
          promotions.length === 0 ? styles.emptyContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
            tintColor={accent}
          />
        }
      />
    </SafeAreaView>
  );
};

export default PromotionHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
