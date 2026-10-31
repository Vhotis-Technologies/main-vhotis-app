import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  ImageProps,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import {
  DealInterface,
  ProductReturnInterface,
} from "@/app/interfaces/seller/ProductInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetProductDetailsQuery } from "@/app/store/seller/api/inventoryApi";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { VideoView, useVideoPlayer } from "expo-video";
import { useLocalSearchParams, router } from "expo-router";
import { shareProductLink } from "@/app/_utils/main/shareActions";
import { useAppSelector } from "@/app/store/store";
import { Seller } from "@/app/interfaces/main/Authentication";
import { allowsProductShare } from "@/app/_utils/seller/productShare";

type MediaItem = {
  kind: "image" | "video";
  index: number;
  uri: string;
};

type SellerProductDetails = ProductReturnInterface & {
  category_name?: string | null;
  views?: number;
  status?: string;
  images?: string[];
  videos?: string[];
};

const HERO_MEDIA_HEIGHT = 310;

const normalizeMedia = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }

  return [];
};

const ProductDetailScreen = () => {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const user = useAppSelector((state) => state.auth.user) as Seller | null;
  const canShareProduct = allowsProductShare(user);
  const { width: windowWidth } = useWindowDimensions();
  const [displayedImage, setDisplayedImage] = useState<ImageProps | null>(null);
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const iconColor = useThemeColor({}, "icons");
  const cardColor = useThemeColor({}, "cards");
  const isDark = backgroundColor === "#000";
  const heroSurface = isDark ? "#1f2933" : "#F4F7FA";

  const {
    data: product,
    isLoading: isLoadingProductDetails,
    error: productDetailsError,
  } = useGetProductDetailsQuery(productId || "", {
    skip: !productId,
  }) as {
    data: SellerProductDetails | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const imageUrls = useMemo(() => normalizeMedia(product?.images), [product]);
  const videoUrls = useMemo(() => normalizeMedia(product?.videos), [product]);
  const activeVideoUri = videoUrls[selectedVideoIndex] ?? "";

  const player = useVideoPlayer(activeVideoUri || "", (p) => {
    if (activeVideoUri) {
      p.loop = false;
      p.muted = false;
    }
  });

  const thumbnailItems = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    imageUrls.forEach((uri, index) => {
      items.push({ kind: "image", index, uri });
    });
    videoUrls.forEach((uri, index) => {
      items.push({ kind: "video", index, uri });
    });
    return items;
  }, [imageUrls, videoUrls]);

  useEffect(() => {
    setSelectedVideoIndex(0);

    if (imageUrls.length > 0) {
      setDisplayedImage({ uri: imageUrls[0] } as ImageProps);
      setShowHeroVideo(false);
    } else if (videoUrls.length > 0) {
      setDisplayedImage(null);
      setShowHeroVideo(true);
    } else {
      setDisplayedImage(null);
      setShowHeroVideo(false);
    }
  }, [imageUrls, videoUrls]);

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

  const hasImages = imageUrls.length > 0;
  const hasVideos = videoUrls.length > 0;

  const handleSponsorProduct = () => {
    if (!product?.id) return;
    router.push({
      pathname: "/seller/main/sponsored/SponsorScreen",
      params: {
        mode: "product",
        productId: product.id,
        productName: product.name,
      },
    });
  };

  const handleCreatePromotion = () => {
    if (!product?.id) return;
    router.push({
      pathname: "/seller/main/promotions/PromotionsScreen",
      params: {
        productId: product.id,
        productName: product.name,
      },
    });
  };

  const handleDisplayImage = (uri: string) => {
    setDisplayedImage({ uri } as ImageProps);
    setShowHeroVideo(false);
  };

  const renderRating = (rating?: number) => {
    if (!rating || rating <= 0) return null;

    return (
      <View style={styles.ratingPill}>
        <AntDesign name="star" size={14} color="#FFB800" />
        <StyledText variant="labelSmall" style={styles.ratingText}>
          {rating.toFixed(1)}
        </StyledText>
      </View>
    );
  };

  const renderStatus = (status?: string) => {
    if (!status) return null;

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "active":
          return "#4CAF50";
        case "inactive":
          return "#F44336";
        case "pending":
          return "#FF9800";
        default:
          return "#64748B";
      }
    };

    return (
      <View
        style={[styles.statusChip, { backgroundColor: getStatusColor(status) }]}
      >
        <StyledText variant="labelSmall" style={styles.whitePillText}>
          {status.toUpperCase()}
        </StyledText>
      </View>
    );
  };

  const renderDealCard = (deal: DealInterface, index: number) => (
    <View
      key={deal.id || index}
      style={[
        styles.dealCard,
        {
          backgroundColor: isDark ? "#1f2933" : "#FFF7ED",
          borderColor: isDark ? "#374151" : "#FED7AA",
        },
      ]}
    >
      <View style={styles.dealHeader}>
        <StyledText
          variant="labelLarge"
          style={[styles.dealName, { color: textColor }]}
        >
          {deal.name}
        </StyledText>
        {deal.is_featured && (
          <View style={styles.featuredBadge}>
            <MaterialIcons name="star" size={12} color="#B8860B" />
            <StyledText variant="labelSmall" style={styles.featuredText}>
              Featured
            </StyledText>
          </View>
        )}
      </View>
      <View style={styles.dealDetails}>
        <StyledText variant="bodySmall" style={styles.dealType}>
          Type: {deal.deal_type.replace("_", " ").toUpperCase()}
        </StyledText>
        {deal.discount_percentage && (
          <StyledText variant="bodyMedium" style={styles.dealDiscount}>
            {deal.discount_percentage}% OFF
          </StyledText>
        )}
        {deal.discount_amount && (
          <StyledText variant="bodyMedium" style={styles.dealDiscount}>
            ${deal.discount_amount} OFF
          </StyledText>
        )}
        {deal.end_date && (
          <StyledText variant="bodySmall" style={styles.dealDate}>
            Valid until: {new Date(deal.end_date).toLocaleDateString()}
          </StyledText>
        )}
      </View>
    </View>
  );

  const renderMediaHero = () => {
    if (showHeroVideo && activeVideoUri) {
      return (
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
      );
    }

    if (displayedImage) {
      return (
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
      );
    }

    if (hasVideos && activeVideoUri) {
      return (
        <View style={styles.heroMediaFill}>
          <VideoView
            style={styles.heroVideo}
            player={player}
            nativeControls
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
          />
        </View>
      );
    }

    return (
      <View style={styles.heroEmpty}>
        <AntDesign name="picture" size={44} color="#BBB" />
        <StyledText variant="labelSmall" style={styles.heroEmptyLabel}>
          No images or video for this product.
        </StyledText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {isLoadingProductDetails && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={buttonColor} />
          <StyledText style={[styles.loadingText, { color: iconColor }]}>
            Loading product details...
          </StyledText>
        </View>
      )}

      {Boolean(productDetailsError) && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF5722" />
          <StyledText style={styles.errorText}>
            Failed to load product details
          </StyledText>
        </View>
      )}

      {product && !isLoadingProductDetails && !productDetailsError && (
        <ScrollView
          style={styles.verticalScroll}
          contentContainerStyle={styles.verticalScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          bounces
        >
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: heroSurface,
                borderColor: borderColor || "#E8E8E8",
              },
            ]}
          >
            <View style={styles.heroInner}>{renderMediaHero()}</View>
            {productId ? (
              <TouchableOpacity
                style={[
                  styles.heroShare,
                  {
                    backgroundColor: cardColor,
                    borderColor,
                    opacity: canShareProduct ? 1 : 0.55,
                  },
                ]}
                onPress={() => {
                  if (!canShareProduct) {
                    router.push("/seller/main/store/SubscriptionPlans");
                    return;
                  }
                  void shareProductLink(productId, product.name);
                }}
                accessibilityLabel={
                  canShareProduct
                    ? "Share product link"
                    : "Upgrade to share product link"
                }
              >
                <MaterialIcons
                  name={canShareProduct ? "share" : "lock"}
                  size={20}
                  color={buttonColor}
                />
              </TouchableOpacity>
            ) : null}
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
                        handleDisplayImage(item.uri);
                      } else {
                        setSelectedVideoIndex(item.index);
                        setShowHeroVideo(true);
                      }
                    }}
                    style={[
                      styles.thumb,
                      {
                        borderColor: isActive ? buttonColor : "transparent",
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
                          size={32}
                          color={buttonColor}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          <View style={styles.badgeRow}>
            {renderRating(product.rating)}
            {product.views !== undefined && (
              <View
                style={[
                  styles.softPill,
                  { backgroundColor: isDark ? "#111827" : "#EEF2F7" },
                ]}
              >
                <MaterialIcons name="visibility" size={15} color={iconColor} />
                <StyledText
                  variant="labelSmall"
                  style={[styles.softPillText, { color: iconColor }]}
                >
                  {product.views} views
                </StyledText>
              </View>
            )}
            {product.is_sponsored && (
              <View style={styles.sponsoredChip}>
                <MaterialIcons name="star" size={13} color="#B8860B" />
                <StyledText variant="labelSmall" style={styles.sponsoredText}>
                  Sponsored
                </StyledText>
              </View>
            )}
          </View>

          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: cardColor,
                borderColor: borderColor || "#E8E8E8",
              },
            ]}
          >
            <View style={styles.actionCardHeader}>
              <MaterialIcons name="trending-up" size={20} color={buttonColor} />
              <StyledText
                variant="titleSmall"
                style={[styles.actionCardTitle, { color: textColor }]}
              >
                Boost this product
              </StyledText>
            </View>
            <StyledText
              variant="bodySmall"
              style={[styles.actionCardSubtitle, { color: iconColor }]}
            >
              Sponsored listings boost visibility. Promotions add discounts (%,
              BOGO, bundles) on this product.
            </StyledText>
            <View style={styles.actionButtonRow}>
              <StyledButton
                title="Sponsor product"
                variant="tonal"
                onPress={handleSponsorProduct}
                buttonStyles={[
                  styles.actionButton,
                  styles.sponsorButton,
                  { borderColor: buttonColor },
                ]}
                textStyles={{ color: buttonColor, fontSize: 13 }}
              />
              <StyledButton
                title="Create promotion"
                variant="tonal"
                onPress={handleCreatePromotion}
                buttonStyles={[
                  styles.actionButton,
                  { backgroundColor: buttonColor, borderWidth: 0 },
                ]}
                textStyles={{ color: "#fff", fontSize: 13 }}
              />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <InfoCard
              title="Description"
              icon="notes"
              cardColor={cardColor}
              borderColor={borderColor}
              textColor={textColor}
              iconColor={iconColor}
            >
              <StyledText
                variant="bodyMedium"
                style={[styles.description, { color: textColor }]}
              >
                {product.description}
              </StyledText>
            </InfoCard>

            {product.information ? (
              <InfoCard
                title="Additional information"
                icon="info-outline"
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={textColor}
                iconColor={iconColor}
              >
                <StyledText
                  variant="bodyMedium"
                  style={[styles.description, { color: textColor }]}
                >
                  {product.information}
                </StyledText>
              </InfoCard>
            ) : null}

            {product.category_name ? (
              <InfoCard
                title="Category"
                icon="category"
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={textColor}
                iconColor={iconColor}
              >
                <View
                  style={[
                    styles.categoryChip,
                    { backgroundColor: `${buttonColor}14` },
                  ]}
                >
                  <StyledText
                    variant="labelLarge"
                    style={{ color: buttonColor, fontWeight: "700" }}
                  >
                    {product.category_name}
                  </StyledText>
                </View>
              </InfoCard>
            ) : null}

            <InfoCard
              title="Inventory & specs"
              icon="inventory-2"
              cardColor={cardColor}
              borderColor={borderColor}
              textColor={textColor}
              iconColor={iconColor}
            >
              <View style={styles.specsGrid}>
                <SpecItem
                  label="Stock"
                  value={
                    product.quantity !== undefined
                      ? product.quantity.toString()
                      : "0"
                  }
                  textColor={textColor}
                  borderColor={borderColor}
                  icon="warehouse"
                />
                <SpecItem
                  label="Weight"
                  value={product.weight ? `${product.weight}` : "Not set"}
                  textColor={textColor}
                  borderColor={borderColor}
                  icon="scale"
                />
                <SpecItem
                  label="Size"
                  value={product.size || "Not set"}
                  textColor={textColor}
                  borderColor={borderColor}
                  icon="straighten"
                />
                <SpecItem
                  label="Media"
                  value={`${imageUrls.length} photos, ${videoUrls.length} videos`}
                  textColor={textColor}
                  borderColor={borderColor}
                  icon="perm-media"
                />
              </View>
            </InfoCard>

            {product.deals && product.deals.length > 0 && (
              <InfoCard
                title={`Active deals (${product.deals.length})`}
                icon="local-offer"
                cardColor={cardColor}
                borderColor={borderColor}
                textColor={textColor}
                iconColor={iconColor}
              >
                {product.deals.map(renderDealCard)}
              </InfoCard>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const InfoCard = ({
  title,
  icon,
  cardColor,
  borderColor,
  textColor,
  iconColor,
  children,
}: {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  cardColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  children: React.ReactNode;
}) => (
  <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor }]}>
    <View style={styles.infoHeader}>
      <MaterialIcons name={icon} size={19} color={iconColor} />
      <StyledText
        variant="titleMedium"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        {title}
      </StyledText>
    </View>
    {children}
  </View>
);

const SpecItem = ({
  label,
  value,
  icon,
  textColor,
  borderColor,
}: {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  textColor: string;
  borderColor: string;
}) => (
  <View style={[styles.specItem, { borderColor }]}>
    <View style={styles.specHeader}>
      <MaterialIcons name={icon} size={17} color="#64748B" />
      <StyledText variant="labelMedium" style={styles.specLabel}>
        {label}
      </StyledText>
    </View>
    <StyledText
      variant="bodyMedium"
      style={[styles.specValue, { color: textColor }]}
    >
      {value}
    </StyledText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  heroShare: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
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
  heroImage: {
    width: "100%",
    height: HERO_MEDIA_HEIGHT,
  },
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
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeBottom: {
    top: undefined,
    bottom: 12,
    backgroundColor: "rgba(30, 64, 175, 0.92)",
  },
  heroBadgeLabel: {
    color: "#fff",
    fontWeight: "700",
  },
  heroEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  heroEmptyLabel: {
    marginTop: 8,
    color: "#999",
    textAlign: "center",
  },
  thumbRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 14,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbVideo: {
    backgroundColor: "#e8ecf4",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  actionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionCardTitle: {
    fontWeight: "700",
  },
  actionCardSubtitle: {
    lineHeight: 18,
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
  },
  sponsorButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  contentContainer: {
    gap: 14,
  },
  name: {
    fontFamily: "RobotoBold",
    marginBottom: 8,
  },
  price: {
    color: "#0E7490",
    fontFamily: "RobotoBold",
    fontSize: 24,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  ratingText: {
    color: "#9A6700",
    fontWeight: "700",
  },
  softPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  softPillText: {
    fontWeight: "700",
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  whitePillText: {
    color: "white",
    fontWeight: "800",
  },
  sponsoredChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sponsoredText: {
    color: "#B8860B",
    fontWeight: "700",
  },
  description: {
    lineHeight: 21,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "RobotoBold",
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  dealCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dealName: {
    fontWeight: "600",
    flex: 1,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: "#B8860B",
    fontWeight: "600",
  },
  dealDetails: {
    gap: 4,
  },
  dealType: {
    color: "#666",
    textTransform: "capitalize",
  },
  dealDiscount: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 16,
  },
  dealDate: {
    color: "#666",
    fontStyle: "italic",
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    flex: 1,
    minWidth: "45%",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  specHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  specLabel: {
    color: "#666",
    fontWeight: "700",
  },
  specValue: {
    fontWeight: "700",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 10,
    color: "#FF5722",
    textAlign: "center",
  },
});

export default ProductDetailScreen;
