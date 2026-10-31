import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSellerReviews } from "@/app/hook/seller/useSellerReviews";
import { SellerProductReview } from "@/app/interfaces/main/orders/ReviewInterfaces";

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ReviewScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const { reviews, isLoading, isFetching, refetch } = useSellerReviews();

  const handlePress = useCallback((review: SellerProductReview) => {
    router.push({
      pathname: "/seller/main/communication/ReviewDetailScreen",
      params: { id: review.id },
    });
  }, []);

  const renderStars = (rating: number) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#F5B301" : mutedColor}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: SellerProductReview }) => (
    <Pressable
      onPress={() => handlePress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        {item.product_image ? (
          <Image
            source={{ uri: item.product_image }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.productImage,
              styles.imagePlaceholder,
              { borderColor },
            ]}
          >
            <Ionicons name="cube-outline" size={18} color={mutedColor} />
          </View>
        )}
        <View style={styles.cardBody}>
          <StyledText
            variant="labelLarge"
            numberOfLines={1}
            style={{ color: textColor, fontWeight: "600" }}
          >
            {item.product_name || "Product"}
          </StyledText>
          {renderStars(item.rating)}
          <StyledText
            variant="bodySmall"
            numberOfLines={2}
            style={{ color: mutedColor, marginTop: 4 }}
          >
            {item.review || "No comment provided"}
          </StyledText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={mutedColor} />
      </View>
      <View style={styles.metaRow}>
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {item.buyer_name}
        </StyledText>
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {item.order_number || item.order_id} · {formatDate(item.submitted_at)}
        </StyledText>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <StyledText variant="titleMedium" style={{ color: textColor }}>
          Customer Reviews
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 4 }}>
          Ratings left by buyers after delivery
        </StyledText>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          reviews.length === 0 ? styles.emptyContent : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={40} color={mutedColor} />
            <StyledText
              variant="titleSmall"
              style={{ color: textColor, marginTop: 12, textAlign: "center" }}
            >
              No reviews yet
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={{
                color: mutedColor,
                marginTop: 8,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              When buyers rate delivered orders, their product feedback will
              appear here.
            </StyledText>
          </View>
        }
      />
    </View>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
});
