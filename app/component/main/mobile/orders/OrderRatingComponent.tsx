import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";
import {
  useGetOrderDetailsQuery,
  useSubmitOrderReviewMutation,
} from "@/app/store/main/api/mainOrderApi";
import { ProductRatingDraft } from "@/app/interfaces/main/orders/ReviewInterfaces";
import { OrderItem } from "@/app/interfaces/main/orders/OrderInterfaces";
import { useSnackbar } from "@/app/contexts/SnackbarContext";

interface OrderRatingComponentProps {
  orderId: string;
}

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => {
  const tintColor = useThemeColor({}, "tint");

  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange(star)}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${star} stars`}
          hitSlop={6}
        >
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={28}
            color={star <= value ? "#F5B301" : tintColor}
          />
        </Pressable>
      ))}
    </View>
  );
};

const OrderRatingComponent = ({ orderId }: OrderRatingComponentProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const { showSnackbar } = useSnackbar();
  const { data: orderDetails, isLoading, isError } = useGetOrderDetailsQuery(
    orderId,
    { skip: !orderId }
  );
  const [submitReview, { isLoading: isSubmitting }] =
    useSubmitOrderReviewMutation();

  const [drafts, setDrafts] = useState<ProductRatingDraft[]>([]);

  useEffect(() => {
    if (!orderDetails?.order_items) return;
    setDrafts(
      orderDetails.order_items.map((item: OrderItem) => ({
        orderItemId: item.id,
        productId: item.product_id,
        productName: item.product_name || item.product || item.product_id,
        image: item.image,
        rating: 0,
        comment: "",
      }))
    );
  }, [orderDetails]);

  const allRated = useMemo(
    () => drafts.length > 0 && drafts.every((item) => item.rating >= 1),
    [drafts]
  );

  const updateDraft = (
    orderItemId: number | string,
    patch: Partial<Pick<ProductRatingDraft, "rating" | "comment">>
  ) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.orderItemId === orderItemId ? { ...item, ...patch } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!orderDetails || !allRated) return;

    try {
      await submitReview({
        order_id: orderDetails.id,
        items: drafts.map((item) => ({
          order_item_id: item.orderItemId,
          rating: item.rating,
          comment: item.comment.trim(),
        })),
      }).unwrap();

      showSnackbar("Thanks for rating your order!", "success");
      router.back();
    } catch (error: any) {
      const message =
        error?.data?.error || "Failed to submit your rating. Please try again.";
      showSnackbar(message, "error");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !orderDetails) {
    return (
      <View style={[styles.centered, { backgroundColor }]}>
        <StyledText variant="bodyMedium" style={{ color: textColor }}>
          Unable to load order details.
        </StyledText>
      </View>
    );
  }

  if (orderDetails.status !== "delivered") {
    return (
      <View style={[styles.centered, { backgroundColor, padding: 24 }]}>
        <StyledText
          variant="bodyMedium"
          style={{ color: textColor, textAlign: "center" }}
        >
          You can only rate orders after they have been delivered.
        </StyledText>
      </View>
    );
  }

  if (orderDetails.is_reviewed) {
    return (
      <View style={[styles.centered, { backgroundColor, padding: 24 }]}>
        <Ionicons name="checkmark-circle" size={48} color="#28A745" />
        <StyledText
          variant="titleSmall"
          style={{ color: textColor, marginTop: 12, textAlign: "center" }}
        >
          You already rated this order
        </StyledText>
        {orderDetails.order_review ? (
          <StyledText
            variant="bodySmall"
            style={{ color: mutedColor, marginTop: 8, textAlign: "center" }}
          >
            Average rating: {orderDetails.order_review.average_rating.toFixed(1)}
          </StyledText>
        ) : null}
      </View>
    );
  }

  const footer = (
    <View style={[styles.footer, { borderColor, backgroundColor: cardColor }]}>
      <StyledButton
        title={isSubmitting ? "Submitting..." : "Submit Review"}
        onPress={handleSubmit}
        disabled={!allRated || isSubmitting}
      />
    </View>
  );

  const footerExtra = (
    <Pressable
      onPress={() => router.back()}
      style={[styles.skipButton, { backgroundColor: cardColor }]}
      accessibilityRole="button"
    >
      <StyledText variant="labelLarge" style={{ color: mutedColor }}>
        Not now
      </StyledText>
    </Pressable>
  );

  return (
    <KeyboardWrapper
      backgroundColor={backgroundColor}
      footer={footer}
      footerExtra={footerExtra}
      contentContainerStyle={styles.scrollContent}
    >
      <StyledText variant="titleMedium" style={{ color: textColor }}>
        Rate your order
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={{ color: mutedColor, marginTop: 6 }}
      >
        Share how each product went. Comments are optional.
      </StyledText>

      {drafts.map((item) => (
        <View
          key={String(item.orderItemId)}
          style={[styles.productCard, { backgroundColor: cardColor, borderColor }]}
        >
          <View style={styles.productHeader}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
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
            <StyledText
              variant="labelLarge"
              style={{ color: textColor, flex: 1 }}
              numberOfLines={2}
            >
              {item.productName}
            </StyledText>
          </View>

          <StarRating
            value={item.rating}
            onChange={(rating) => updateDraft(item.orderItemId, { rating })}
          />

          <TextInput
            value={item.comment}
            onChangeText={(comment) =>
              updateDraft(item.orderItemId, { comment })
            }
            placeholder="Add an optional comment"
            placeholderTextColor={mutedColor}
            multiline
            style={[
              styles.commentInput,
              {
                color: textColor,
                borderColor,
                backgroundColor: backgroundColor,
              },
            ]}
          />
        </View>
      ))}
    </KeyboardWrapper>
  );
};

export default OrderRatingComponent;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  footer: {
    padding: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
});
