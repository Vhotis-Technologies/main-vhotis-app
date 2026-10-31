import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGetTopProductStatisticsQuery } from "@/app/store/seller/api/dashboardApi";
import { useCampaignHistoryStoreId } from "@/app/hook/seller/useCampaignHistoryStoreId";
import { TopProductStatisticsInterface } from "@/app/interfaces/seller/DashboardInterfaces";
import EmptyState from "@/app/component/helpers/EmptyState";

const TopProductDetailsScreen = () => {
  const router = useRouter();
  /* Get the product id from the params using useLocalSearchParams */
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const storeId = useCampaignHistoryStoreId();

  const {
    data: productData,
    isLoading,
    error,
  } = useGetTopProductStatisticsQuery({
    productId: productId || "",
    storeId,
  });

  const screenWidth = Dimensions.get("window").width;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 16 }}
        >
          Loading product details...
        </StyledText>
      </View>
    );
  }

  if (error || !productData) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={iconColor} />
          </Pressable>
          <StyledText
            variant="titleLarge"
            style={[styles.headerTitle, { color: textColor }]}
          >
            Product Details
          </StyledText>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState
          title="Product Not Found"
          subtitle="Unable to load product details. Please try again."
          style={styles.emptyState}
        />
      </View>
    );
  }

  /* Create a stats cards array from the product data */
  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(productData.total_revenue || 0, "ireland"),
      icon: "money" as const,
      color: "#10B981",
    },
    {
      title: "Total Views",
      value: (productData.total_views || 0).toLocaleString(),
      icon: "visibility" as const,
      color: "#3B82F6",
    },
    {
      title: "Total Sales",
      value: (productData.total_sales || 0).toLocaleString(),
      icon: "shopping-cart" as const,
      color: "#8B5CF6",
    },
    {
      title: "Total Orders",
      value: (productData.total_orders || 0).toLocaleString(),
      icon: "receipt" as const,
      color: "#F59E0B",
    },
  ];

  /* Render the image item */
  const renderImageItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <Image
      source={{ uri: item }}
      style={[styles.imageItem, { width: screenWidth }]}
      contentFit="cover"
    />
  );

  const onImageScroll = (event: any) => {
    const slideSize = screenWidth;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </Pressable>
        <StyledText
          variant="titleLarge"
          style={[styles.headerTitle, { color: textColor }]}
        >
          {productData.name}
        </StyledText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Images Carousel */}
        {productData.images && productData.images.length > 0 && (
          <View style={styles.imageSection}>
            <FlatList
              data={productData.images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => `image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth}
              decelerationRate="fast"
              onMomentumScrollEnd={onImageScroll}
            />
            {productData.images.length > 1 && (
              <View style={styles.imageCounter}>
                <StyledText variant="labelSmall" style={{ color: "white" }}>
                  {currentImageIndex + 1} / {productData.images.length}
                </StyledText>
              </View>
            )}
          </View>
        )}

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <StyledText
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: 16 },
            ]}
          >
            Statistics
          </StyledText>
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  <MaterialIcons
                    name={stat.icon as any}
                    size={24}
                    color={stat.color}
                  />
                </View>
                <StyledText
                  variant="titleMedium"
                  style={[styles.statValue, { color: textColor }]}
                >
                  {stat.value}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={[styles.statLabel, { color: textColor }]}
                >
                  {stat.title}
                </StyledText>
              </View>
            ))}
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.infoSection}>
          <StyledText
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: textColor, marginBottom: 16 },
            ]}
          >
            Product Information
          </StyledText>

          {/* Price */}
          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <StyledText variant="titleMedium" style={{ color: tintColor }}>
              {formatCurrency(productData.price || 0, "ireland")}
            </StyledText>
            {productData.rating > 0 && (
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FBBF24" />
                <StyledText
                  variant="bodyMedium"
                  style={{ color: textColor, marginLeft: 4 }}
                >
                  {productData.rating.toFixed(1)}
                </StyledText>
              </View>
            )}
          </View>

          {/* Description */}
          {productData.description && (
            <View style={[styles.infoItem, { borderBottomColor: borderColor }]}>
              <StyledText
                variant="labelLarge"
                style={[styles.infoLabel, { color: textColor }]}
              >
                Description
              </StyledText>
              <StyledText
                variant="bodyMedium"
                style={[styles.infoValue, { color: textColor }]}
              >
                {productData.description}
              </StyledText>
            </View>
          )}

          {/* Category */}
          {productData.category_name && (
            <View style={[styles.infoItem, { borderBottomColor: borderColor }]}>
              <StyledText
                variant="labelLarge"
                style={[styles.infoLabel, { color: textColor }]}
              >
                Category
              </StyledText>
              <View
                style={[styles.categoryChip, { backgroundColor: cardColor }]}
              >
                <StyledText variant="bodyMedium" style={{ color: textColor }}>
                  {productData.category_name}
                </StyledText>
              </View>
            </View>
          )}

          {/* Specifications Grid */}
          <View style={styles.specsGrid}>
            {productData.quantity !== undefined && (
              <View
                style={[
                  styles.specItem,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.specLabel, { color: textColor }]}
                >
                  Stock
                </StyledText>
                <StyledText
                  variant="titleMedium"
                  style={[styles.specValue, { color: textColor }]}
                >
                  {productData.quantity}
                </StyledText>
              </View>
            )}
            {productData.size && (
              <View
                style={[
                  styles.specItem,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.specLabel, { color: textColor }]}
                >
                  Size
                </StyledText>
                <StyledText
                  variant="titleMedium"
                  style={[styles.specValue, { color: textColor }]}
                >
                  {productData.size}
                </StyledText>
              </View>
            )}
            {productData.weight && (
              <View
                style={[
                  styles.specItem,
                  { backgroundColor: cardColor, borderColor },
                ]}
              >
                <StyledText
                  variant="labelLarge"
                  style={[styles.specLabel, { color: textColor }]}
                >
                  Weight
                </StyledText>
                <StyledText
                  variant="titleMedium"
                  style={[styles.specValue, { color: textColor }]}
                >
                  {productData.weight}
                </StyledText>
              </View>
            )}
          </View>

          {/* Videos Section */}
          {productData.videos && productData.videos.length > 0 && (
            <View style={styles.videosSection}>
              <StyledText
                variant="titleLarge"
                style={[
                  styles.sectionTitle,
                  { color: textColor, marginBottom: 16 },
                ]}
              >
                Videos
              </StyledText>
              {productData.videos.map((video: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.videoContainer,
                    { backgroundColor: cardColor, borderColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="video"
                    size={40}
                    color={tintColor}
                  />
                  <StyledText
                    variant="bodyMedium"
                    style={{ color: textColor, marginTop: 8 }}
                  >
                    Video {index + 1}
                  </StyledText>
                  {/* Note: Video player implementation would go here */}
                </View>
              ))}
            </View>
          )}

          {/* Timestamps */}
          <View style={styles.timestampSection}>
            {productData.created_at && (
              <View style={styles.timestampRow}>
                <MaterialIcons name="event" size={16} color={iconColor} />
                <StyledText
                  variant="bodySmall"
                  style={{ color: textColor, marginLeft: 8 }}
                >
                  Created:{" "}
                  {new Date(productData.created_at).toLocaleDateString()}
                </StyledText>
              </View>
            )}
            {productData.updated_at && (
              <View style={styles.timestampRow}>
                <MaterialIcons name="update" size={16} color={iconColor} />
                <StyledText
                  variant="bodySmall"
                  style={{ color: textColor, marginLeft: 8 }}
                >
                  Updated:{" "}
                  {new Date(productData.updated_at).toLocaleDateString()}
                </StyledText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TopProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    height: 350,
    position: "relative",
  },
  imageItem: {
    height: 350,
  },
  imageCounter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    opacity: 0.7,
    textAlign: "center",
  },
  infoSection: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  infoLabel: {
    marginBottom: 8,
    fontWeight: "600",
  },
  infoValue: {
    lineHeight: 22,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  specItem: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  specLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  specValue: {
    fontWeight: "600",
  },
  videosSection: {
    marginTop: 24,
  },
  videoContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 150,
  },
  timestampSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
