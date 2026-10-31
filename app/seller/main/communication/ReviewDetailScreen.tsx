import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSellerReviews } from "@/app/hook/seller/useSellerReviews";

const ReviewDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const { reviews, isLoading } = useSellerReviews();
  const review = useMemo(
    () => reviews.find((item) => item.id === id),
    [reviews, id]
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={[styles.centered, { backgroundColor, padding: 24 }]}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          Review not found.
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={textColor} />
      </Pressable>

      <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.productRow}>
          {review.product_image ? (
            <Image
              source={{ uri: review.product_image }}
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
              <Ionicons name="cube-outline" size={22} color={mutedColor} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <StyledText
              variant="titleSmall"
              style={{ color: textColor, fontWeight: "700" }}
            >
              {review.product_name || "Product"}
            </StyledText>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? "star" : "star-outline"}
                  size={18}
                  color={star <= review.rating ? "#F5B301" : mutedColor}
                />
              ))}
            </View>
          </View>
        </View>

        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, marginTop: 16, lineHeight: 22 }}
        >
          {review.review || "No comment provided."}
        </StyledText>
      </View>

      <View style={[styles.metaCard, { backgroundColor: cardColor, borderColor }]}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          Order details
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 8 }}>
          Order: {review.order_number || review.order_id}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 4 }}>
          Buyer: {review.buyer_name}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 4 }}>
          Submitted: {new Date(review.submitted_at).toLocaleString()}
        </StyledText>
      </View>
    </ScrollView>
  );
};

export default ReviewDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: "flex-start",
    padding: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  productRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  starRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
});
