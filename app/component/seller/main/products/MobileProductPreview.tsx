import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Chip, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { ProductInterface } from "@/app/interfaces/seller/ProductInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";

interface ProductPreviewProps {
  data: ProductInterface;
  categories: TrendingCategoryInterface[];
}

const MobileProductPreview = ({
  data,
  categories,
}: ProductPreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const backgroundcolor = useThemeColor({}, "background");

  // Normalize media data coming from both draft objects and API payloads.
  const displayImages = useMemo(() => {
    if (!Array.isArray(data.images)) return [];
    return data.images.filter(Boolean);
  }, [data.images]);

  const videoSource = useMemo(() => {
    const videos = data.videos;
    if (!videos) return "";
    if (typeof videos === "string") return videos;
    if (Array.isArray(videos)) return videos.find(Boolean) || "";
    if (typeof videos === "object" && typeof videos.uri === "string") {
      return videos.uri;
    }
    return "";
  }, [data.videos]);

  const hasVideo = Boolean(videoSource);

  // Initialize video player (always call hook for consistency)
  const player = useVideoPlayer(videoSource, (player) => {
    if (videoSource) {
      player.loop = false;
      player.muted = false;
    }
  });

  // Track playing state
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (currentImageIndex > 0 && currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, displayImages.length]);

  useEffect(() => {
    if (!showVideo) {
      player.pause();
      return;
    }
    if (!hasVideo) {
      setShowVideo(false);
    }
  }, [showVideo, hasVideo, player]);

  // Get category name from category_id
  const categoryName = useMemo(() => {
    if (!data.category_id || !categories || categories.length === 0)
      return null;
    const category = categories.find(
      (cat: TrendingCategoryInterface) => cat.id === data.category_id
    );
    return category?.title || null;
  }, [data.category_id, categories]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (displayImages?.length ?? 0) - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (displayImages?.length ?? 0) - 1 : prev - 1
    );
  };

  // Helper function to get image source
  const getImageSource = (imageData: any) => {
    if (typeof imageData === "string") {
      return { uri: imageData };
    } else if (imageData && imageData.uri) {
      return { uri: imageData.uri };
    } else {
      return imageData; // For require() images
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundcolor }]}>
      <ScrollView
        style={styles.previewContainer}
        contentContainerStyle={styles.previewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle between Images and Video */}
        {hasVideo && displayImages.length > 0 && (
          <View style={styles.mediaToggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showVideo && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setShowVideo(false);
                if (player) player.pause();
              }}
            >
              <MaterialIcons
                name="photo-library"
                size={20}
                color={!showVideo ? "#2a52be" : "#6B7280"}
              />
              <StyledText
                variant="labelSmall"
                style={[
                  styles.toggleButtonText,
                  !showVideo && styles.toggleButtonTextActive,
                ]}
              >
                Images
              </StyledText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showVideo && styles.toggleButtonActive,
              ]}
              onPress={() => setShowVideo(true)}
            >
              <MaterialIcons
                name="videocam"
                size={20}
                color={showVideo ? "#2a52be" : "#6B7280"}
              />
              <StyledText
                variant="labelSmall"
                style={[
                  styles.toggleButtonText,
                  showVideo && styles.toggleButtonTextActive,
                ]}
              >
                Video
              </StyledText>
            </TouchableOpacity>
          </View>
        )}

        {/* Media Display Section */}
        <View style={styles.previewImageContainer}>
          {!showVideo ? (
            <>
              {/* Images View */}
              {displayImages.length > 0 ? (
                <Image
                  source={getImageSource(displayImages[currentImageIndex])}
                  style={styles.previewImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.noImageContainer}>
                  <MaterialIcons name="image" size={80} color="#ccc" />
                  <StyledText variant="bodyMedium" style={styles.noImageText}>
                    No images added
                  </StyledText>
                </View>
              )}

              {/* Image Navigation Buttons */}
              {displayImages.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.imageNavButton, styles.leftButton]}
                    onPress={handlePrevImage}
                  >
                    <MaterialIcons
                      name="chevron-left"
                      size={40}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.imageNavButton, styles.rightButton]}
                    onPress={handleNextImage}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={40}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
              )}

              {/* Image Counter */}
              {displayImages.length > 1 && (
                <View style={styles.imageCounter}>
                  <StyledText
                    variant="labelSmall"
                    style={styles.imageCounterText}
                    children={`${currentImageIndex + 1}/${
                      displayImages.length
                    }`}
                  />
                </View>
              )}

              {/* Video Badge on Images */}
              {hasVideo && (
                <TouchableOpacity
                  style={styles.videoBadge}
                  onPress={() => setShowVideo(true)}
                >
                  <MaterialIcons name="videocam" size={16} color="white" />
                  <StyledText
                    variant="labelSmall"
                    style={styles.videoBadgeText}
                  >
                    Tap to watch video
                  </StyledText>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {/* Video View */}
              {hasVideo && (
                <View style={styles.videoContainer}>
                  <VideoView
                    style={styles.video}
                    player={player}
                    fullscreenOptions={{ enable: true }}
                    allowsPictureInPicture
                    nativeControls
                  />

                  {/* Custom Play/Pause Overlay */}
                  <TouchableOpacity
                    style={styles.videoOverlay}
                    onPress={() => {
                      if (isPlaying) {
                        player.pause();
                      } else {
                        player.play();
                      }
                    }}
                  >
                    {!isPlaying && (
                      <View style={styles.playButton}>
                        <MaterialIcons
                          name="play-arrow"
                          size={60}
                          color="white"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Thumbnail Strip - only show for images, not video */}
        {!showVideo && displayImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailStrip}
            contentContainerStyle={styles.thumbnailContent}
          >
            {displayImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentImageIndex(index)}
                style={styles.thumbnail}
              >
                <Image
                  source={getImageSource(img)}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Details Card */}
        <View style={[styles.detailsCard]}>
          {/* Product Title */}
          <View style={styles.titleSection}>
            <StyledText
              variant="titleLarge"
              children={data.name || "Untitled Product"}
            />
            {categoryName && (
              <Chip icon="label" style={styles.categoryChip}>
                {categoryName}
              </Chip>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View>
              <StyledText variant="labelSmall" style={styles.priceLabel}>
                Price
              </StyledText>
              <StyledText
                variant="headlineMedium"
                style={styles.priceText}
                children={formatCurrency(data.price || 0)}
              />
            </View>
            <View style={styles.stockBadge}>
              <MaterialIcons name="inventory" size={20} color="#10B981" />
              <View style={styles.stockInfo}>
                <StyledText variant="labelSmall" style={styles.stockLabel}>
                  In Stock
                </StyledText>
                <StyledText variant="titleSmall" style={styles.stockQuantity}>
                  {data.quantity || 0} units
                </StyledText>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="description" size={20} color="#2a52be" />
              <StyledText variant="titleSmall" style={styles.sectionTitle}>
                Description
              </StyledText>
            </View>
            <StyledText
              variant="bodyMedium"
              style={styles.descriptionText}
              children={data.description || "No description provided"}
            />
          </View>

          {/* Product Information - only show if exists */}
          {data.information && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name="info-outline"
                    size={20}
                    color="#2a52be"
                  />
                  <StyledText variant="titleSmall" style={styles.sectionTitle}>
                    Product Information
                  </StyledText>
                </View>
                <StyledText
                  variant="bodyMedium"
                  style={styles.descriptionText}
                  children={data.information}
                />
              </View>
            </>
          )}

          <Divider style={styles.divider} />

          {/* Specifications Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info-outline" size={20} color="#2a52be" />
              <StyledText variant="titleSmall" style={styles.sectionTitle}>
                Specifications
              </StyledText>
            </View>
            <View style={styles.specsGrid}>
              <View style={styles.specCard}>
                <MaterialIcons name="straighten" size={24} color="#6B7280" />
                <StyledText variant="labelSmall" style={styles.specLabel}>
                  Size
                </StyledText>
                <StyledText variant="bodyMedium" style={styles.specValue}>
                  {data.size || "Not specified"}
                </StyledText>
              </View>
              <View style={styles.specCard}>
                <MaterialIcons
                  name="fitness-center"
                  size={24}
                  color="#6B7280"
                />
                <StyledText variant="labelSmall" style={styles.specLabel}>
                  Weight
                </StyledText>
                <StyledText variant="bodyMedium" style={styles.specValue}>
                  {data.weight || "Not specified"}
                </StyledText>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          {!categoryName && (
            <View style={styles.warningBanner}>
              <MaterialIcons name="warning" size={20} color="#F59E0B" />
              <StyledText variant="bodySmall" style={styles.warningText}>
                No category selected. Please select a category before
                publishing.
              </StyledText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    paddingBottom: 20,
  },
  previewImageContainer: {
    width: "100%",
    height: 350,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  noImageText: {
    color: "#9ca3af",
  },
  imageNavButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -22 }],
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageCounterText: {
    color: "white",
    fontWeight: "600",
  },
  videoBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(42, 82, 190, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  videoBadgeText: {
    color: "white",
    fontWeight: "600",
  },
  thumbnailStrip: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  thumbnailContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  detailsCard: {
    margin: 5,
    borderRadius: 16,
    padding: 10,
  },
  titleSection: {
    gap: 12,
  },
  productTitle: {
    fontWeight: "700",
    color: "#111827",
    lineHeight: 32,
  },
  categoryChip: {
    alignSelf: "flex-start",
  },
  divider: {
    marginVertical: 20,
    backgroundColor: "#e5e7eb",
  },
  priceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "#6b7280",
    marginBottom: 4,
  },
  priceText: {
    color: "#2a52be",
    fontWeight: "700",
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stockInfo: {
    gap: 2,
  },
  stockLabel: {
    color: "#059669",
    fontWeight: "600",
  },
  stockQuantity: {
    color: "#047857",
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#374151",
  },
  descriptionText: {
    color: "#6b7280",
    lineHeight: 24,
  },
  specsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  specCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  specLabel: {
    color: "#9ca3af",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  specValue: {
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningText: {
    flex: 1,
    color: "#92400e",
    lineHeight: 20,
  },
  mediaToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 2,
  },
  toggleButtonActive: {
    borderColor: "#2a52be",
  },
  toggleButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#2a52be",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MobileProductPreview;
