import { CategoryDataReach } from "@/app/interfaces/seller/DashboardInterfaces";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import CategoryRowComponent from "./CategoryRowComponent";
import ProductReachComponent from "./ProductReachComponent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetProductReachByCategoryQuery } from "@/app/store/seller/api/dashboardApi";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";
interface CategoryHeatMapComponentProps {
  data?: CategoryDataReach;
  width: number;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CategoryHeatMapComponent = ({
  data,
  width,
}: CategoryHeatMapComponentProps) => {
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    id: number;
  } | null>(null);

  const storeId = useCampaignHistoryStoreId();

  // Add API call
  const { data: productReachData, isLoading: isProductReachLoading } =
    useGetProductReachByCategoryQuery(
      {
        categoryId: selectedCategory?.id?.toString() || "0",
        storeId,
      },
      {
        skip: !selectedCategory, // Only fetch when category is selected
      },
    );

  const borderColor = useThemeColor({}, "borders");

  // Calculate dimensions - match CategoryRowComponent calculations exactly
  const contentWidth = width - 40; // Account for container padding (20px on each side)
  const categoryWidth = contentWidth * 0.2; // 20% for category label
  const heatmapWidth = contentWidth - categoryWidth - 10; // Remaining space minus category margin
  const cellWidth = (heatmapWidth - 48) / 7; // Divide by 7 days, accounting for 6 gaps of 8px (48px total)

  return (
    <View style={[styles.container, { borderColor }]}>
      <View style={styles.header}>
        <StyledText
          variant="labelLarge"
          children="Product Reach"
          style={{ alignSelf: "center" }}
        />
        <View style={styles.legend}>
          <StyledText variant="labelSmall" children="0-5k " />
          <View style={[styles.legendBox, { backgroundColor: "#EEF1F6" }]} />
          <StyledText variant="labelSmall" children="5k-10k" />
          <View style={[styles.legendBox, { backgroundColor: "#CBD3E5" }]} />
          <StyledText variant="labelSmall" children="10k-50k" />
          <View style={[styles.legendBox, { backgroundColor: "#8494C4" }]} />
          <StyledText variant="labelSmall" children="50k+" />
          <View style={[styles.legendBox, { backgroundColor: "#4154A3" }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {data && Object.entries(data).length > 0 ? (
          Object.entries(data).map(([category, categoryData]) => (
            <TouchableOpacity
              key={category}
              onPress={() =>
                setSelectedCategory({
                  name: category,
                  id: categoryData.id,
                })
              }
              style={styles.rowContainer}
            >
              <CategoryRowComponent
                category={category}
                reach={categoryData.views}
                width={contentWidth}
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <StyledText variant="bodyMedium" style={styles.noDataText}>
              No data available
            </StyledText>
          </View>
        )}
      </ScrollView>

      <View style={[styles.daysContainer, { marginLeft: categoryWidth + 10 }]}>
        {DAYS.map((day, index) => (
          <StyledText
            key={index}
            variant="labelSmall"
            style={[styles.dayText, { width: cellWidth }]}
          >
            {day}
          </StyledText>
        ))}
      </View>

      <ProductReachComponent
        visible={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory?.name || ""}
        products={productReachData?.data || {}}
        isLoading={isProductReachLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    padding: 10,
  },
  header: {
    marginBottom: 16,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  rowContainer: {
    width: "100%",
    marginBottom: 4,
  },
  scrollView: {
    width: "100%",
  },
  daysContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  dayText: {
    textAlign: "center",
    fontSize: 12,
  },
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noDataText: {
    opacity: 0.7,
    textAlign: "center",
  },
});

export default CategoryHeatMapComponent;
