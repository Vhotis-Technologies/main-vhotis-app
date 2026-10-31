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
import MobileSponsorHistoryComponent from "@/app/component/seller/sponsored/MobileSponsorHistoryComponent";
import CampaignHistoryHero from "@/app/component/seller/shared/CampaignHistoryHero";
import { PromotionHistoryInterface } from "@/app/interfaces/seller/PromotionsInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useGetSponsorHistoryQuery } from "@/app/store/seller/api/sponsorshipApi";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";
import {
  CampaignHistorySection,
  groupCampaignsByStatus,
  summarizeCampaigns,
} from "@/app/utils/campaignHistory";
import { formatCurrency } from "@/app/_utils/main/helpers";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";

const SPONSOR_ACCENT = "#6366F1";

const SponsorHistoryScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");
  const cardColor = useThemeColor({}, "cards");

  const storeId = useCampaignHistoryStoreId();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: sponsorships = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSponsorHistoryQuery(storeId);

  const summary = useMemo(() => summarizeCampaigns(sponsorships), [sponsorships]);
  const sections = useMemo(
    () => groupCampaignsByStatus(sponsorships),
    [sponsorships],
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
      accent={SPONSOR_ACCENT}
      cardColor={cardColor}
      statTextColor={textColor}
      icon="star-outline"
      title={
        summary.total > 0
          ? `${summary.total} sponsorship${summary.total === 1 ? "" : "s"}`
          : "No sponsorships yet"
      }
      subtitle={
        summary.total > 0
          ? "Featured placement campaigns for your store and products"
          : "Sponsor listings to appear higher in search and browse"
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
      <View
        style={[styles.sectionBadge, { backgroundColor: `${SPONSOR_ACCENT}20` }]}
      >
        <StyledText
          variant="labelSmall"
          style={{ color: SPONSOR_ACCENT, fontWeight: "700" }}
        >
          {section.data.length}
        </StyledText>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: PromotionHistoryInterface }) => (
    <MobileSponsorHistoryComponent sponsorship={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrap,
          {
            backgroundColor: `${SPONSOR_ACCENT}14`,
            borderColor: `${SPONSOR_ACCENT}35`,
          },
        ]}
      >
        <MaterialIcons name="campaign" size={40} color={SPONSOR_ACCENT} />
      </View>
      <StyledText
        variant="titleSmall"
        style={{ color: textColor, marginTop: 16, textAlign: "center" }}
      >
        {isError ? "Couldn't load sponsorship history" : "No sponsorships yet"}
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
          : "Pay for store-wide or product sponsorship from Sponsored listings."}
      </StyledText>
      {!isError ? (
        <StyledButton
          title="Start sponsoring"
          onPress={() => router.push("/seller/main/sponsored/SponsorScreen")}
          variant="medium"
          buttonStyles={{ marginTop: 20, width: "100%", maxWidth: 280 }}
        />
      ) : null}
    </View>
  );

  if (isLoading && sponsorships.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={SPONSOR_ACCENT} />
          <StyledText variant="bodyMedium" style={{ color: mutedColor, marginTop: 12 }}>
            Loading sponsorship history...
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
          `${item.storeId ?? "store"}-sponsor-${item.type}-${item.id}`
        }
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHero}
        ListEmptyComponent={renderEmpty}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={
          sponsorships.length === 0 ? styles.emptyContent : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
            tintColor={SPONSOR_ACCENT}
          />
        }
      />
    </SafeAreaView>
  );
};

export default SponsorHistoryScreen;

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
