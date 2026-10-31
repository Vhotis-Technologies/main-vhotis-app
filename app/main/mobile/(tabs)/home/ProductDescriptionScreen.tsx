import {
  ImageProps,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import React, { useState, useMemo, useEffect } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { AntDesign, MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
  ProductDetailsInterface,
  ReviewInterface,
} from "@/app/interfaces/main/product/Iteminterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useGetProductDetailsQuery } from "@/app/store/main/api/homeApi";
import { router, useLocalSearchParams } from "expo-router";
import {
  formatCurrency,
  formatDuration,
  limitDescription,
  formatDealBadge,
} from "@/app/_utils/main/helpers";
import {
  resolveProductPriceDisplay,
} from "@/app/_utils/main/dealPricing";
import useMainCart from "@/app/hook/main/useMainCart";
import useMainProfile from "@/app/hook/main/useMainProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO_MEDIA_HEIGHT = 320;

/** Avoid `value && <View/>` patterns: `0` and `""` leak as raw text children in React Native. */
const hasTrimmedText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

type InfoTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: string;
  mutedColor: string;
  textColor: string;
  cardColor: string;
  borderColor: string;
};

const InfoTile = ({
  icon,
  label,
  value,
  accent,
  mutedColor,
  textColor,
  cardColor,
  borderColor,
}: InfoTileProps) => (
  <View
    style={[
      styles.infoTile,
      { backgroundColor: cardColor, borderColor: borderColor || "#E8E8E8" },
    ]}
  >
    <View style={[styles.infoTileIcon, { backgroundColor: `${accent ?? mutedColor}18` }]}>
      <Ionicons name={icon} size={18} color={accent ?? mutedColor} />
    </View>
    <StyledText variant="labelSmall" style={{ color: mutedColor }}>
      {label}
    </StyledText>
    <StyledText
      variant="labelMedium"
      style={{ color: accent ?? textColor, fontWeight: "600" }}
      numberOfLines={2}
    >
      {value}
    </StyledText>
  </View>
);

type SectionCardProps = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  cardColor: string;
  borderColor: string;
  textColor: string;
  tintColor: string;
};

const SectionCard = ({
  title,
  icon,
  children,
  cardColor,
  borderColor,
  textColor,
  tintColor,
}: SectionCardProps) => (
  <View
    style={[
      styles.sectionCard,
      { backgroundColor: cardColor, borderColor: borderColor || "#E8E8E8" },
    ]}
  >
    <View style={styles.sectionTitleRow}>
      {icon ? (
        <View style={[styles.sectionIconWrap, { backgroundColor: `${tintColor}18` }]}>
          <Ionicons name={icon} size={16} color={tintColor} />
        </View>
      ) : null}
      <StyledText variant="labelMedium" style={[styles.sectionHeading, { color: textColor }]}>
        {title}
      </StyledText>
    </View>
    {children}
  </View>
);

const getReviewInitials = (username: string) => {
  const parts = username.trim().split(/\s+/).filter(Boolean);
  if (!parts.length || username.toLowerCase() === "anonymous") return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRatingLabel = (rating: number) => {
  if (rating >= 5) return "Excellent";
  if (rating >= 4) return "Good";
  if (rating >= 3) return "Average";
  if (rating >= 2) return "Fair";
  return "Poor";
};

const StarRating = ({
  rating,
  size = 14,
  mutedColor,
}: {
  rating: number;
  size?: number;
  mutedColor: string;
}) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        size={size}
        color={star <= rating ? "#F5B301" : mutedColor}
      />
    ))}
  </View>
);

const ReviewCard = ({ review }: { review: ReviewInterface }) => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");
  const tintColor = useThemeColor({}, "tint");

  const initials = getReviewInitials(review.username);
  const ratingLabel = getRatingLabel(review.rating);
  const hasComment = hasTrimmedText(review.review);

  return (
    <View
      style={[
        styles.reviewCard,
        {
          backgroundColor: cardColor,
          borderColor: borderColor || "#E8E8E8",
        },
      ]}
    >
      <View style={styles.reviewTopRow}>
        <View
          style={[
            styles.reviewAvatar,
            { backgroundColor: `${tintColor}22`, borderColor: `${tintColor}44` },
          ]}
        >
          <StyledText
            variant="labelMedium"
            style={[styles.reviewAvatarText, { color: tintColor }]}
          >
            {initials}
          </StyledText>
        </View>

        <View style={styles.reviewIdentity}>
          <StyledText
            variant="labelLarge"
            style={[styles.reviewUsername, { color: textColor }]}
            numberOfLines={1}
          >
            {review.username}
          </StyledText>
          <View style={styles.reviewMetaRow}>
            <Ionicons name="checkmark-circle" size={13} color="#28A745" />
            <StyledText variant="labelSmall" style={styles.verifiedLabel}>
              Verified purchase
            </StyledText>
          </View>
        </View>

        <View style={styles.ratingBadge}>
          <AntDesign name="star" size={12} color="#F5B301" />
          <StyledText variant="labelMedium" style={styles.ratingBadgeValue}>
            {review.rating.toFixed(1)}
          </StyledText>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <StarRating rating={review.rating} mutedColor={mutedColor} />
        <StyledText variant="labelSmall" style={{ color: mutedColor }}>
          {ratingLabel}
        </StyledText>
      </View>

      {hasComment ? (
        <View
          style={[
            styles.reviewQuote,
            { borderLeftColor: `${tintColor}55`, backgroundColor: `${tintColor}08` },
          ]}
        >
          <StyledText variant="bodySmall" style={[styles.reviewBody, { color: textColor }]}>
            {review.review.trim()}
          </StyledText>
        </View>
      ) : (
        <StyledText variant="bodySmall" style={{ color: mutedColor, fontStyle: "italic" }}>
          No written comment
        </StyledText>
      )}
    </View>
  );
};

const ProductDescriptionScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "icons");
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");
  const isDark = backgroundColor === "#000";

  const {
    data: productDetails,
    isLoading,
    isError,
    error,
  } = useGetProductDetailsQuery(id || "", {
    skip: !id,
  }) as {
    data: ProductDetailsInterface | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };

  const { addProductToCart, isAddingToCartItem } = useMainCart();
  const { handleAddToWishlist, addingToWishlist, isInWishlist } =
    useMainProfile();

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<ImageProps | null>(null);
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const videoUrls = productDetails?.videos?.filter(Boolean) ?? [];
  const activeVideoUri = videoUrls[selectedVideoIndex] ?? "";

  const player = useVideoPlayer(activeVideoUri || "", (p) => {
    if (activeVideoUri) {
      p.loop = false;
      p.muted = false;
    }
  });

  const thumbnailItems = useMemo(() => {
    if (!productDetails) return [];
    const items: { kind: "image" | "video"; index: number; uri: string }[] = [];
    (productDetails.images ?? []).filter(Boolean).forEach((uri, i) => {
      items.push({ kind: "image", index: i, uri });
    });
    (productDetails.videos ?? [])
      .filter(Boolean)
      .forEach((uri: string, i: number) => {
        items.push({ kind: "video", index: i, uri });
      });
    return items;
  }, [productDetails]);

  useEffect(() => {
    if (!productDetails) return;
    const imgs = (productDetails.images ?? []).filter(Boolean);
    const vids = (productDetails.videos ?? []).filter(Boolean);
    setSelectedVideoIndex(0);
    if (imgs.length > 0) {
      setDisplayedImage({ uri: imgs[0] } as ImageProps);
      setShowHeroVideo(false);
    } else if (vids.length > 0) {
      setDisplayedImage(null);
      setShowHeroVideo(true);
    } else {
      setDisplayedImage(null);
      setShowHeroVideo(false);
    }
  }, [productDetails]);

  useEffect(() => {
    if (!showHeroVideo) {
      try {
        player.pause();
      } catch {
        /* player may not be ready */
      }
    }
  }, [showHeroVideo, player]);

  const displayedImageUri =
    displayedImage &&
    typeof displayedImage === "object" &&
    displayedImage !== null &&
    "uri" in displayedImage &&
    typeof (displayedImage as { uri?: string }).uri === "string"
      ? (displayedImage as { uri: string }).uri
      : null;

  const handleDisplayImage = (image: ImageProps) => {
    setDisplayedImage(image);
    setShowHeroVideo(false);
  };

  const handleAddToCart = (bundleAdd = false) => {
    if (!id) return;
    if (bundleAdd) {
      addProductToCart(id, { bundleAdd: true });
      return;
    }
    addProductToCart(id);
  };

  const onHeartPress = async () => {
    if (id && productDetails) {
      await handleAddToWishlist(id, productDetails.name);
    }
  };

  const isEnterpriseSubscriber = () =>
    productDetails?.subscription_plan?.includes("Enterprise") ?? false;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centeredState, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (isError) {
    const message =
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: string }).message === "string"
        ? (error as { message: string }).message
        : "Something went wrong";
    return (
      <View style={[styles.container, styles.centeredState, { backgroundColor }]}>
        <AntDesign name="exclamation-circle" size={48} color="#DC3545" />
        <StyledText variant="labelMedium" style={[styles.stateTitle, { color: textColor }]}>
          Failed to load product details
        </StyledText>
        <StyledText variant="labelSmall" style={[styles.stateSubtitle, { color: mutedColor }]}>
          {message}
        </StyledText>
      </View>
    );
  }

  if (!productDetails) {
    return (
      <View style={[styles.container, styles.centeredState, { backgroundColor }]}>
        <AntDesign name="heart" size={48} color={mutedColor} />
        <StyledText variant="labelMedium" style={[styles.stateTitle, { color: textColor }]}>
          Product not found
        </StyledText>
      </View>
    );
  }

  const hasVideos = videoUrls.length > 0;
  const hasImages = (productDetails.images ?? []).filter(Boolean).length > 0;
  const showDeliveryTime = Number(productDetails.delivery_time_hours) > 0;
  const reviews = productDetails.reviews ?? [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const heroSurface = isDark ? "#2a2a2a" : "#F0F2F5";

  const stockColor =
    productDetails.stock_status === "In Stock"
      ? "#28A745"
      : productDetails.stock_status === "Low Stock"
        ? "#E6A700"
        : "#DC3545";

  const isOutOfStock = productDetails.stock_status === "Out of Stock";
  const priceDisplay = resolveProductPriceDisplay(productDetails);
  const bogoDealBadge =
    priceDisplay.isBogo && productDetails.deal
      ? formatDealBadge("bogo", {
          bogo_buy_quantity: productDetails.deal.bogo_buy_quantity,
          bogo_get_quantity: productDetails.deal.bogo_get_quantity,
        })
      : null;
  const addToCartLabel =
    priceDisplay.isBogo && priceDisplay.bogoBundleSize
      ? `Add deal bundle (${priceDisplay.bogoBundleSize})`
      : "Add to basket";
  const deliveryLabel =
    productDetails.shipping_fee === 0
      ? "At checkout"
      : formatCurrency(productDetails.shipping_fee);
  const deliveryLocationLabel = hasTrimmedText(productDetails.delivery_location)
    ? productDetails.delivery_location.trim()
    : "Not specified";
  const distanceLabel =
    productDetails.distance > 0
      ? `${productDetails.distance} km away`
      : "Not specified";

  const stickyFooterPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + stickyFooterPadding },
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={styles.page}>
          {/* Store */}
          <Pressable
            style={({ pressed }) => [
              styles.storeChip,
              {
                backgroundColor: cardColor,
                borderColor: borderColor || "#E0E0E0",
                opacity: !isEnterpriseSubscriber() ? 0.55 : pressed ? 0.88 : 1,
              },
            ]}
            disabled={!isEnterpriseSubscriber()}
            onPress={() => {
              if (isEnterpriseSubscriber()) {
                router.push({
                  pathname: "/main/mobile/(tabs)/home/StoreFrontScreen",
                  params: { storeId: productDetails.seller_info?.shop_id },
                });
              }
            }}
          >
            <View style={[styles.storeIconWrap, { backgroundColor: `${tintColor}18` }]}>
              <MaterialIcons name="storefront" size={18} color={tintColor} />
            </View>
            <View style={styles.storeCopy}>
              <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                Sold by
              </StyledText>
              <StyledText
                variant="labelMedium"
                style={{ color: textColor, fontWeight: "700" }}
                numberOfLines={1}
              >
                {hasTrimmedText(productDetails.shop_name)
                  ? productDetails.shop_name.trim()
                  : "Store"}
              </StyledText>
            </View>
            {isEnterpriseSubscriber() ? (
              <Ionicons name="chevron-forward" size={18} color={mutedColor} />
            ) : null}
          </Pressable>

          {/* Hero gallery */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: heroSurface,
                borderColor: borderColor || "#E8E8E8",
              },
            ]}
          >
            <View style={styles.heroInner}>
              {showHeroVideo && activeVideoUri ? (
                <View style={styles.heroMediaFill}>
                  <VideoView
                    style={styles.heroVideo}
                    player={player}
                    nativeControls
                    fullscreenOptions={{ enable: true }}
                    allowsPictureInPicture
                  />
                  {hasImages ? (
                    <TouchableOpacity
                      style={styles.heroBadge}
                      onPress={() => setShowHeroVideo(false)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="photo-library" size={16} color="#fff" />
                      <StyledText variant="labelSmall" style={styles.heroBadgeLabel}>
                        Photos
                      </StyledText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : displayedImage ? (
                <View style={styles.heroMediaFill}>
                  <Image
                    source={displayedImage}
                    style={styles.heroImage}
                    contentFit="contain"
                  />
                  {hasVideos ? (
                    <TouchableOpacity
                      style={[styles.heroBadge, styles.heroBadgeBottom]}
                      onPress={() => {
                        setSelectedVideoIndex(0);
                        setShowHeroVideo(true);
                      }}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="videocam" size={16} color="#fff" />
                      <StyledText variant="labelSmall" style={styles.heroBadgeLabel}>
                        Watch video
                      </StyledText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : hasVideos && activeVideoUri ? (
                <View style={styles.heroMediaFill}>
                  <VideoView
                    style={styles.heroVideo}
                    player={player}
                    nativeControls
                    fullscreenOptions={{ enable: true }}
                    allowsPictureInPicture
                  />
                </View>
              ) : (
                <View style={styles.heroEmpty}>
                  <AntDesign name="picture" size={44} color="#BBB" />
                  <StyledText variant="labelSmall" style={styles.heroEmptyLabel}>
                    No image available
                  </StyledText>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.heroWishlist, { backgroundColor: cardColor, borderColor }]}
              onPress={onHeartPress}
              disabled={addingToWishlist}
              accessibilityLabel="Wishlist"
            >
              {addingToWishlist ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : (
                <Ionicons
                  name={isInWishlist(id || "") ? "heart" : "heart-outline"}
                  size={22}
                  color="#E53935"
                />
              )}
            </TouchableOpacity>
          </View>

          {thumbnailItems.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbRow}
              style={{ maxWidth: windowWidth }}
            >
              {thumbnailItems.map((item) => {
                const isActive =
                  item.kind === "image"
                    ? !showHeroVideo && displayedImageUri === item.uri
                    : showHeroVideo && selectedVideoIndex === item.index;
                return (
                  <TouchableOpacity
                    key={`${item.kind}-${item.index}`}
                    onPress={() => {
                      if (item.kind === "image") {
                        handleDisplayImage({ uri: item.uri } as ImageProps);
                      } else {
                        setSelectedVideoIndex(item.index);
                        setShowHeroVideo(true);
                      }
                    }}
                    style={[
                      styles.thumb,
                      {
                        borderColor: isActive ? tintColor : "transparent",
                        backgroundColor: cardColor,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    {item.kind === "image" ? (
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.thumbImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.thumbImage, styles.thumbVideo]}>
                        <MaterialIcons
                          name="play-circle-filled"
                          size={28}
                          color={tintColor}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          {!hasImages && !hasVideos ? (
            <View style={styles.inlineNotice}>
              <StyledText variant="labelSmall" style={{ color: mutedColor, textAlign: "center" }}>
                No images or video for this product.
              </StyledText>
            </View>
          ) : null}

          {/* Title & price */}
          <View style={styles.productHeader}>
            {productDetails.discount_value > 0 ? (
              <View style={styles.dealTag}>
                <Ionicons name="flash" size={12} color="#fff" />
                <StyledText variant="labelSmall" style={styles.dealTagText}>
                  {productDetails.discount_value}% off · Limited deal
                </StyledText>
              </View>
            ) : null}

            <StyledText variant="titleMedium" style={[styles.productTitle, { color: textColor }]}>
              {productDetails.name}
            </StyledText>

            <View style={styles.titleMetaRow}>
              {productDetails.rating > 0 ? (
                <View style={styles.titleRating}>
                  <StarRating rating={Math.round(productDetails.rating)} size={13} mutedColor={mutedColor} />
                  <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                    {productDetails.rating.toFixed(1)}
                    {reviews.length > 0
                      ? ` · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
                      : ""}
                  </StyledText>
                </View>
              ) : null}
              {hasTrimmedText(productDetails.category) ? (
                <View style={[styles.categoryPill, { backgroundColor: `${tintColor}14` }]}>
                  <StyledText variant="labelSmall" style={{ color: tintColor, fontWeight: "600" }}>
                    {productDetails.category.trim()}
                  </StyledText>
                </View>
              ) : null}
            </View>

            <View style={styles.priceCard}>
              <View style={styles.priceBlock}>
                {priceDisplay.showStrikethrough ? (
                  <StyledText variant="labelMedium" style={styles.priceWas}>
                    {formatCurrency(productDetails.price)}
                  </StyledText>
                ) : null}
                <StyledText variant="headlineSmall" style={[styles.priceMain, { color: textColor }]}>
                  {formatCurrency(priceDisplay.salePrice ?? productDetails.price)}
                </StyledText>
                {bogoDealBadge ? (
                  <View style={[styles.dealPill, { backgroundColor: `${tintColor}14` }]}>
                    <StyledText variant="labelSmall" style={{ color: tintColor, fontWeight: "700" }}>
                      {bogoDealBadge}
                    </StyledText>
                  </View>
                ) : null}
                {priceDisplay.dealSubtext ? (
                  <StyledText variant="labelSmall" style={{ color: tintColor, marginTop: 6, fontWeight: "600" }}>
                    {priceDisplay.dealSubtext}
                  </StyledText>
                ) : null}
              </View>
              <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                VAT included
              </StyledText>
            </View>
          </View>

          {/* Quick info grid */}
          <View style={styles.infoGrid}>
            <InfoTile
              icon="bicycle-outline"
              label="Delivery"
              value={deliveryLabel}
              mutedColor={mutedColor}
              textColor={textColor}
              cardColor={cardColor}
              borderColor={borderColor}
              accent={tintColor}
            />
            <InfoTile
              icon="time-outline"
              label="Est. arrival"
              value={
                showDeliveryTime
                  ? formatDuration(productDetails.delivery_time_hours)
                  : "Varies"
              }
              mutedColor={mutedColor}
              textColor={textColor}
              cardColor={cardColor}
              borderColor={borderColor}
              accent={tintColor}
            />
            <InfoTile
              icon="cube-outline"
              label="Availability"
              value={productDetails.stock_status}
              mutedColor={mutedColor}
              textColor={textColor}
              cardColor={cardColor}
              borderColor={borderColor}
              accent={stockColor}
            />
            <InfoTile
              icon="navigate-outline"
              label="Distance"
              value={distanceLabel}
              mutedColor={mutedColor}
              textColor={textColor}
              cardColor={cardColor}
              borderColor={borderColor}
              accent={tintColor}
            />
          </View>

          {/* Delivery details */}
          <SectionCard
            title="Delivery details"
            icon="location-outline"
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            tintColor={tintColor}
          >
            <View style={styles.detailList}>
              <View style={styles.detailRow}>
                <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                  Deliver to
                </StyledText>
                <StyledText variant="labelMedium" style={{ color: textColor, flex: 1, textAlign: "right" }}>
                  {deliveryLocationLabel}
                </StyledText>
              </View>
              {productDetails.weight > 0 ? (
                <View style={styles.detailRow}>
                  <StyledText variant="labelSmall" style={{ color: mutedColor }}>
                    Weight
                  </StyledText>
                  <StyledText variant="labelMedium" style={{ color: textColor }}>
                    {productDetails.weight} g
                  </StyledText>
                </View>
              ) : null}
              {productDetails.secure_transaction ? (
                <View style={[styles.trustBanner, { backgroundColor: "#28A74514" }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#28A745" />
                  <StyledText variant="labelSmall" style={styles.secureLabel}>
                    Secure transaction protected
                  </StyledText>
                </View>
              ) : null}
            </View>
          </SectionCard>

          <SectionCard
            title="About this item"
            icon="document-text-outline"
            cardColor={cardColor}
            borderColor={borderColor}
            textColor={textColor}
            tintColor={tintColor}
          >
            <StyledText variant="bodySmall" style={[styles.descriptionBody, { color: textColor }]}>
              {limitDescription(productDetails.description ?? "")}
            </StyledText>
          </SectionCard>

          {/* Reviews */}
          <View style={styles.reviewsBlock}>
            <View style={styles.reviewsHeader}>
              <StyledText variant="labelMedium" style={[styles.reviewsSectionTitle, { color: textColor }]}>
                Customer reviews
              </StyledText>
              {reviews.length > 0 ? (
                <View style={styles.reviewsSummary}>
                  <AntDesign name="star" size={13} color="#F5B301" />
                  <StyledText variant="labelSmall" style={styles.reviewsSummaryText}>
                    {productDetails.rating.toFixed(1)} · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </StyledText>
                </View>
              ) : null}
            </View>
            {reviews.length > 0 ? (
              <View style={styles.reviewList}>
                {visibleReviews.map((item, index) => (
                  <View key={`review-${index}`}>
                    {index > 0 ? <View style={styles.reviewSpacer} /> : null}
                    <ReviewCard review={item} />
                  </View>
                ))}
                {reviews.length > 3 ? (
                  <TouchableOpacity
                    onPress={() => setShowAllReviews((v) => !v)}
                    style={[styles.toggleReviews, { borderColor }]}
                  >
                    <StyledText variant="labelSmall" style={[styles.linkText, { color: tintColor }]}>
                      {showAllReviews ? "Show less" : `Show all ${reviews.length} reviews`}
                    </StyledText>
                    <Ionicons
                      name={showAllReviews ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={tintColor}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <View
                style={[
                  styles.emptyReviews,
                  { backgroundColor: cardColor, borderColor: borderColor || "#E8E8E8" },
                ]}
              >
                <Ionicons name="star-outline" size={36} color={mutedColor} />
                <StyledText variant="labelMedium" style={{ color: textColor, marginTop: 8 }}>
                  No reviews yet
                </StyledText>
                <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 4, textAlign: "center" }}>
                  Be the first to share your experience after purchase.
                </StyledText>
              </View>
            )}
          </View>

          {hasTrimmedText(productDetails.info) ? (
            <SectionCard
              title="Product information"
              icon="information-circle-outline"
              cardColor={cardColor}
              borderColor={borderColor}
              textColor={textColor}
              tintColor={tintColor}
            >
              <StyledText variant="bodySmall" style={[styles.descriptionBody, { color: textColor }]}>
                {productDetails.info.trim()}
              </StyledText>
            </SectionCard>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: cardColor,
            borderTopColor: borderColor || "#E8E8E8",
            paddingBottom: stickyFooterPadding,
          },
        ]}
      >
        <View style={styles.stickyPriceCol}>
          <StyledText variant="labelSmall" style={{ color: mutedColor }}>
            {priceDisplay.isBogo ? "Unit price" : "Total"}
          </StyledText>
          <StyledText variant="titleMedium" style={{ color: textColor, fontWeight: "800" }}>
            {formatCurrency(priceDisplay.salePrice ?? productDetails.price)}
          </StyledText>
          {priceDisplay.dealSubtext ? (
            <StyledText variant="labelSmall" style={{ color: tintColor, marginTop: 2 }}>
              {priceDisplay.dealSubtext}
            </StyledText>
          ) : null}
        </View>
        <StyledButton
          title={isOutOfStock ? "Out of stock" : addToCartLabel}
          onPress={() => handleAddToCart(priceDisplay.isBogo)}
          variant="basket"
          buttonStyles={styles.stickyButton}
          loading={isAddingToCartItem(id || "")}
          disabled={isOutOfStock || isAddingToCartItem(id || "")}
        />
      </View>
    </View>
  );
};

export default ProductDescriptionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  stateTitle: {
    marginTop: 16,
    textAlign: "center",
  },
  stateSubtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  storeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  storeCopy: { flex: 1, minWidth: 0 },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  heroInner: {
    width: "100%",
    height: HERO_MEDIA_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  heroMediaFill: {
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: { width: "100%", height: HERO_MEDIA_HEIGHT },
  heroVideo: {
    width: "100%",
    height: HERO_MEDIA_HEIGHT,
    backgroundColor: "#000",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.62)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeBottom: {
    top: undefined,
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(30, 64, 175, 0.92)",
  },
  heroBadgeLabel: { color: "#fff", fontWeight: "600" },
  heroWishlist: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heroEmptyLabel: { marginTop: 8, color: "#999" },
  thumbRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 2,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbVideo: {
    backgroundColor: "#e8ecf4",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineNotice: { paddingVertical: 4 },
  productHeader: { gap: 10 },
  dealTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DC3545",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dealTagText: { color: "#fff", fontWeight: "700" },
  productTitle: { lineHeight: 28 },
  titleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  titleRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceCard: { gap: 4, marginTop: 4 },
  priceBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  priceMain: { fontWeight: "800" },
  priceWas: {
    textDecorationLine: "line-through",
    color: "#999",
    marginBottom: 4,
    opacity: 0.55,
    fontWeight: "600",
  },
  dealPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoTile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  infoTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: { fontWeight: "700", marginBottom: 0 },
  detailList: { gap: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  secureLabel: { color: "#28A745", fontWeight: "600" },
  descriptionBody: { lineHeight: 22 },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sellerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerCopy: { flex: 1, minWidth: 0 },
  reviewsBlock: { gap: 12 },
  reviewsSectionTitle: { fontWeight: "700" },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(245, 179, 1, 0.12)",
  },
  reviewsSummaryText: { fontWeight: "600", color: "#B8860B" },
  reviewList: { gap: 0 },
  reviewSpacer: { height: 12 },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  reviewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { fontWeight: "700", letterSpacing: 0.5 },
  reviewIdentity: { flex: 1, minWidth: 0 },
  reviewUsername: { fontWeight: "700" },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  verifiedLabel: { color: "#28A745", fontWeight: "600" },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(245, 179, 1, 0.14)",
  },
  ratingBadgeValue: { fontWeight: "800", color: "#B8860B" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starRow: { flexDirection: "row", gap: 3 },
  reviewQuote: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewBody: { lineHeight: 21 },
  toggleReviews: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  linkText: { fontWeight: "600" },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickyPriceCol: { minWidth: 90 },
  stickyButton: { flex: 1 },
});
