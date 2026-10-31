import StyledText from "@/app/component/helpers/forms/StyledText";
import TotalSalesComponent from "@/app/component/seller/shared/TotalSalesComponent";
import DashboardDataDisplay from "@/app/component/seller/web/dashboard/DashboardDataDisplay";
import CategoryHeatMapComponent from "@/app/component/seller/shared/CategoryHeatMapComponent";
import OrderInformationComponent from "@/app/component/seller/shared/OrderInformationComponent";
import EmptyState from "@/app/component/helpers/EmptyState";
import { OrderInformationData } from "@/app/interfaces/seller/DashboardInterfaces";
import TopTrendingProductsInterface from "@/app/interfaces/seller/SharedInterfaces";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";
import MobileTrendingProducts from "@/app/component/seller/main/mobile_dashboard/MobileTrendingProducts";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import useSellerDashboard from "@/app/hook/seller/useSellerDashboard";
import { useRouter } from "expo-router";

const DashboardScreen = () => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const textColor = useThemeColor({}, "text");
  const { showCenterModal, closeModal } = useModalService();

  /* Widths for the components */
  const [orderWidth, setOrderWidth] = useState(0);
  const [totalSalesWidth, setTotalSalesWidth] = useState(0);
  const [productReachWidth, setProductReachWidth] = useState(0);

  // Use the dashboard hook
  const {
    bestSellingProductsData: trendingProducts,
    isBestSellingProductsLoading: isTrendingProductsLoading,
    totalSalesData,
    isDashboardLoading,
    isTotalSalesLoading,
    orderInformationData,
    isOrderInformationLoading,
    totalProductsSoldData,
    isTotalProductsSoldLoading,
    totalViewsData,
    isTotalViewsLoading,
    conversionRateData,
    isConversionRateLoading,
    totalRevenueData,
    isTotalRevenueLoading,
    categoryReachData,
    isCategoryReachLoading,
    setCurrentBestSellingProductsPeriod: setBestSellingTimeframe,
    setCurrentTotalSalesPeriod: setTotalSalesTimeframe,
    setCurrentOrderInformationPeriod: setOrderInfoTimeframe,
    setCurrentDashboardStatsPeriod: setDashboardStatsTimeframe,
    currentBestSellingProductsPeriod: bestSellingTimeframe,
    currentTotalSalesPeriod: totalSalesTimeframe,
    currentOrderInformationPeriod: orderInfoTimeframe,
    currentDashboardStatsPeriod: dashboardStatsTimeframe,
  } = useSellerDashboard();

  /* Check the sales data is valid so that the empty state can either be triggered or not */
  const hasValidSalesData = (salesData: any) => {
    return (
      salesData &&
      salesData.data &&
      Array.isArray(salesData.data) &&
      salesData.data.length > 0 &&
      salesData.currentPeriodTotal > 0
    );
  };

  const hasValidOrderData = (orderData: any) => {
    return (
      orderData &&
      (orderData.delivered > 0 ||
        orderData.shipped > 0 ||
        orderData.returned > 0 ||
        orderData.total > 0)
    );
  };

  const hasValidCategoryData = (categoryData: any) => {
    if (!categoryData || Object.keys(categoryData).length === 0) return false;
    return Object.values(categoryData).some((entry: any) => {
      if (
        typeof entry !== "object" ||
        !entry ||
        !entry.views ||
        typeof entry.views !== "object"
      ) {
        return false;
      }
      return Object.keys(entry.views).length > 0;
    });
  };

  // Dashboard items with real API data
  const dashboardItems = [
    {
      lastPeriod: conversionRateData?.previous_period_rate || 0,
      currentPeriod: conversionRateData?.current_period_rate || 0,
      title: "Conversion Rate",
      isLoading: isConversionRateLoading,
    },
    {
      lastPeriod: totalProductsSoldData?.previous_total_products_sold || 0,
      currentPeriod: totalProductsSoldData?.total_products_sold || 0,
      title: "Products Sold",
      isLoading: isTotalProductsSoldLoading,
    },
    {
      lastPeriod: totalViewsData?.previous_total_views || 0,
      currentPeriod: totalViewsData?.total_views || 0,
      title: "Total Views",
      isLoading: isTotalViewsLoading,
    },
    {
      lastPeriod: totalRevenueData?.previousPeriodTotal || 0,
      currentPeriod: totalRevenueData?.currentPeriodTotal || 0,
      title: "Total Revenue",
      isLoading: isTotalRevenueLoading,
    },
  ];

  const handleTimeframeSelect = (
    component: string,
    timeframe: "weekly" | "monthly"
  ) => {
    switch (component) {
      case "totalSales":
        setTotalSalesTimeframe(timeframe);
        break;
      case "orderInfo":
        setOrderInfoTimeframe(timeframe);
        break;
      case "dashboardStats":
        setDashboardStatsTimeframe(timeframe);
        break;
      case "trendingProducts":
        setBestSellingTimeframe(timeframe);
        break;
    }
    closeModal();
  };

  const showTimeframeOverlay = (component: string) => {
    const TimeframeModalContent = (
      <View style={{ padding: 20, minWidth: 200 }}>
        <StyledText
          variant="labelLarge"
          style={[
            { marginBottom: 20, fontWeight: "600", textAlign: "center" },
            { color: textColor },
          ]}
        >
          Select Timeframe
        </StyledText>
        <Pressable
          style={styles.timeframeOption}
          onPress={() => handleTimeframeSelect(component, "weekly")}
        >
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            Weekly
          </StyledText>
        </Pressable>
        <Pressable
          style={styles.timeframeOption}
          onPress={() => handleTimeframeSelect(component, "monthly")}
        >
          <StyledText variant="labelMedium" style={{ color: textColor }}>
            Monthly
          </StyledText>
        </Pressable>
      </View>
    );

    showCenterModal(TimeframeModalContent);
  };

  /* Display a loading state while the data is getting fetched */
  if (isDashboardLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: backgroundColor,
        }}
      >
        <ActivityIndicator size="large" color={iconColor} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor }}>
      <ScrollView
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <DashboardDataDisplay
              lastPeriod={dashboardItems[0].lastPeriod}
              currentPeriod={dashboardItems[0].currentPeriod}
              title={dashboardItems[0].title || ""}
              onDateChange={() => showTimeframeOverlay("dashboardStats")}
              timeframe={dashboardStatsTimeframe}
              isLoading={dashboardItems[0].isLoading}
            />
          </View>
          <View style={styles.statCard}>
            <DashboardDataDisplay
              lastPeriod={dashboardItems[1].lastPeriod}
              currentPeriod={dashboardItems[1].currentPeriod}
              title={dashboardItems[1].title || ""}
              onDateChange={() => showTimeframeOverlay("dashboardStats")}
              timeframe={dashboardStatsTimeframe}
              isLoading={dashboardItems[1].isLoading}
            />
          </View>
          <View style={styles.statCard}>
            <DashboardDataDisplay
              lastPeriod={dashboardItems[2].lastPeriod}
              currentPeriod={dashboardItems[2].currentPeriod}
              title={dashboardItems[2].title || ""}
              onDateChange={() => showTimeframeOverlay("dashboardStats")}
              timeframe={dashboardStatsTimeframe}
              isLoading={dashboardItems[2].isLoading}
            />
          </View>
          <View style={styles.statCard}>
            <DashboardDataDisplay
              lastPeriod={dashboardItems[3].lastPeriod}
              currentPeriod={dashboardItems[3].currentPeriod}
              title={dashboardItems[3].title || ""}
              onDateChange={() => showTimeframeOverlay("dashboardStats")}
              timeframe={dashboardStatsTimeframe}
              isLoading={dashboardItems[3].isLoading}
            />
          </View>
        </View>

        {/* Total Sales Chart */}
        <View
          style={styles.chartSection}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setTotalSalesWidth(width);
          }}
        >
          <View style={styles.sectionHeader}>
            <StyledText
              variant="labelLarge"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Total Sales
            </StyledText>
            <Pressable
              style={styles.dotsButton}
              onPress={() => showTimeframeOverlay("totalSales")}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={iconColor}
              />
            </Pressable>
          </View>

          {isTotalSalesLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <StyledText variant="bodyMedium" style={{ color: textColor }}>
                Loading sales data...
              </StyledText>
            </View>
          ) : !hasValidSalesData(totalSalesData) ? (
            <EmptyState
              title="No Sales Data"
              subtitle="Your sales data will appear here once you start making sales"
              iconName="chart-line"
              style={styles.emptyStateContainer}
            />
          ) : (
            <TotalSalesComponent
              width={totalSalesWidth}
              onPeriodChange={(periodType) =>
                setTotalSalesTimeframe(periodType)
              }
              salesData={
                totalSalesData || {
                  data: [],
                  currentPeriodTotal: 0,
                  previousPeriodTotal: 0,
                }
              }
              isLoading={isTotalSalesLoading}
              timeframe={totalSalesTimeframe}
            />
          )}
        </View>

        {/* Order Information Component */}
        <View
          style={styles.chartSection}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setOrderWidth(width);
          }}
        >
          <View style={styles.sectionHeader}>
            <StyledText
              variant="labelLarge"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Order Information
            </StyledText>
            <Pressable
              style={styles.dotsButton}
              onPress={() => showTimeframeOverlay("orderInfo")}
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={iconColor}
              />
            </Pressable>
          </View>

          {isOrderInformationLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <StyledText variant="bodyMedium" style={{ color: textColor }}>
                Loading order information...
              </StyledText>
            </View>
          ) : !hasValidOrderData(orderInformationData) ? (
            <EmptyState
              title="No Orders Yet"
              subtitle="Your order information will appear here once you receive orders"
              iconName="package-variant"
              style={styles.emptyStateContainer}
            />
          ) : (
            <OrderInformationComponent
              width={orderWidth}
              orderData={
                orderInformationData || {
                  delivered: 0,
                  shipped: 0,
                  returned: 0,
                  total: 0,
                }
              }
              timeframe={orderInfoTimeframe}
            />
          )}
        </View>

        {/* Category Heat Map Component */}
        <View
          style={[styles.chartSection]}
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setProductReachWidth(width);
          }}
        >
          {isCategoryReachLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <StyledText variant="bodyMedium" style={{ color: textColor }}>
                Loading category reach data...
              </StyledText>
            </View>
          ) : !hasValidCategoryData(categoryReachData) ? (
            <EmptyState
              title="No Category Data"
              subtitle="Category performance data will appear here once you have products in different categories"
              iconName="chart-bar"
              style={styles.emptyStateContainer}
            />
          ) : productReachWidth > 0 ? (
            <CategoryHeatMapComponent
              data={categoryReachData || {}}
              width={productReachWidth}
            />
          ) : (
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, textAlign: "center", padding: 20 }}
            >
              Loading heatmap...
            </StyledText>
          )}
        </View>

        {/* Trending Products Section */}
        <View style={styles.trendingSection}>
          <MobileTrendingProducts
            data={trendingProducts || []}
            onProductPress={(productId: string) => {
              // Navigate to product details screen
              router.push({
                pathname:
                  "/seller/main/dashboard/TopProductDetailsScreen",
                params: { productId },
              });
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    minWidth: 150,
    borderWidth: 0.3,
  },
  chartSection: {
    marginTop: 16,
    padding: 5,
  },
  trendingSection: {
    marginTop: 10,
    padding: 5,
    borderRadius: 5,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  dotsButton: {
    padding: 5,
  },
  timeframeOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 24,
  },
  emptyDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    minHeight: 200,
  },
  emptyDataText: {
    textAlign: "center",
    marginBottom: 8,
    fontSize: 16,
  },
  emptyDataSubtext: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 14,
  },
  emptyStateContainer: {
    minHeight: 200,
    marginVertical: 20,
  },
});
