import React, { useState, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import KeyboardWrapper from "@/app/component/helpers/KeyboardWrapper";
import { router } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Button } from "react-native-paper";
import MobileProductPreview from "@/app/component/seller/main/products/MobileProductPreview";
import { ProductInterface } from "@/app/interfaces/seller/ProductInterface";
import { Text } from "react-native-paper";
import StoreLocationPicker from "@/app/component/seller/shared/StoreLocationPicker";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import ImageSelectionModal from "@/app/component/helpers/others/ImageSelectionModal";
import VideoSelectionModal from "@/app/component/helpers/others/VideoSelectionModal";
import InfoPopup from "@/app/component/helpers/others/InfoPopup";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEvent } from "expo";

const InventoryScreen = () => {
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [isInfoPopupVisible, setIsInfoPopupVisible] = useState(false);
  const infoIconRef = useRef<View>(null);
  const { showFullscreenModal } = useModalService();
  const {
    showImageSelectionModal,
    hideImageSelectionModal,
    handleCameraSelection,
    handleFileSelection,
    isImageModalVisible,
    handleProductUpdate,
    currentProduct,
    handleVideoCameraSelection,
    handleVideoFileSelection,
    categories,
    isLoadingCategories,
    handleAddProduct,
    isLoadingAddProduct,
    showListingFeeNotice,
    listingUnitFee,
    getListingFeeBreakdownForForm,
    sellerStores,
    isLoadingSellerStores,
    selectedUploadStoreId,
    setSelectedUploadStoreId,
  } = useSellerInventory();

  const listingQty = Math.max(
    1,
    parseInt(String(currentProduct?.quantity ?? "1"), 10) || 1,
  );
  const feeBreakdown = getListingFeeBreakdownForForm(listingQty);

  const showVideoSelectionModal = () => {
    setIsVideoModalVisible(true);
  };

  const hideVideoSelectionModal = () => {
    setIsVideoModalVisible(false);
  };

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");
  const borderColor = useThemeColor({}, "borders");
  const iconColor = useThemeColor({}, "icons");
  const textColor = useThemeColor({}, "text");
  // Video player setup
  const videoSource =
    currentProduct?.videos?.uri || currentProduct?.videos || "";
  const videoPlayer = useVideoPlayer(videoSource, (player) => {
    if (videoSource) {
      player.loop = false;
      player.muted = false;
    }
  });

  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer.playing,
  });

  // Check if all required fields are filled
  const isFormValid = () => {
    const hasName = currentProduct?.name && currentProduct.name.trim() !== "";
    const hasDescription =
      currentProduct?.description && currentProduct.description.trim() !== "";
    const hasCategory = currentProduct?.category_id !== undefined;
    const hasPrice =
      currentProduct?.price &&
      !isNaN(parseFloat(currentProduct.price.toString())) &&
      parseFloat(currentProduct.price.toString()) > 0;

    return hasName && hasDescription && hasCategory && hasPrice;
  };

  // Handle showing preview modal
  const handleShowPreview = () => {
    showFullscreenModal(
      <MobileProductPreview
        data={currentProduct as ProductInterface}
        categories={categories || []}
      />,
      "Product Preview",
    );
  };

  // Handle showing price and quantity information popup
  const handleShowPriceInfo = () => {
    setIsInfoPopupVisible(!isInfoPopupVisible);
  };

  // Clean size input: replace spaces with asterisks
  const cleanSizeInput = (text: string): string => {
    return text.replace(/\s/g, "*");
  };

  const formValid = isFormValid();

  const footer = (
    <View
      style={[
        styles.footer,
        { backgroundColor: cardColor, borderTopColor: borderColor },
      ]}
    >
      <StyledButton
        variant="tonal"
        title={isLoadingAddProduct ? "Adding..." : "Add Product"}
        onPress={handleAddProduct}
        loading={isLoadingAddProduct}
        disabled={isLoadingAddProduct || !formValid}
        buttonStyles={styles.footerButton}
      />
      {formValid ? (
        <StyledButton
          variant="tonal"
          title="Preview"
          onPress={handleShowPreview}
          buttonStyles={styles.footerButton}
        />
      ) : (
        <View
          style={[
            styles.previewHintContainer,
            { borderColor, backgroundColor: `${buttonColor}08` },
          ]}
        >
          <MaterialIcons name="info-outline" size={16} color={iconColor} />
          <StyledText
            variant="labelSmall"
            style={[styles.previewHintText, { color: iconColor }]}
            children="Complete all required fields (*) to preview your product"
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Image Selection Modal */}
      <ImageSelectionModal
        isVisible={isImageModalVisible}
        onClose={hideImageSelectionModal}
        onCameraPress={handleCameraSelection}
        onFilePress={handleFileSelection}
      />

      {/* Video Selection Modal */}
      <VideoSelectionModal
        isVisible={isVideoModalVisible}
        onClose={hideVideoSelectionModal}
        onCameraPress={() => {
          hideVideoSelectionModal();
          handleVideoCameraSelection();
        }}
        onFilePress={() => {
          hideVideoSelectionModal();
          handleVideoFileSelection();
        }}
      />

      {/* Info Popup */}
      <InfoPopup
        visible={isInfoPopupVisible}
        onClose={() => setIsInfoPopupVisible(false)}
        anchorRef={infoIconRef}
        position="top-right"
        content={
          <View style={styles.infoPopupContent}>
            <StyledText
              variant="bodySmall"
              style={{
                color: "#000",
                fontSize: 9,
                lineHeight: 11,
                textAlign: "center",
              }}
              children="Price: VAT included. Qty: stock count."
            />
          </View>
        }
      />

      <KeyboardWrapper
        backgroundColor={backgroundColor}
        footer={footer}
        contentContainerStyle={styles.keyboardScrollContent}
      >
        <View style={styles.formContainer}>
          <StoreLocationPicker
            stores={sellerStores}
            selectedStoreId={selectedUploadStoreId}
            onSelectStore={setSelectedUploadStoreId}
            isLoading={isLoadingSellerStores}
            label="Upload to store"
          />

          {showListingFeeNotice ? (
            <View
              style={[
                styles.listingFeeBanner,
                { backgroundColor: `${buttonColor}14`, borderColor },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={18}
                color={buttonColor}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <StyledText variant="bodySmall" style={{ color: textColor }}>
                  Listing fee: €{listingUnitFee.toFixed(2)} per unit in stock ×{" "}
                  {listingQty} {listingQty === 1 ? "unit" : "units"} = €
                  {feeBreakdown.calculated.toFixed(2)} when you tap Add Product.
                  Each new product listing counts as 1 toward your plan limit
                  (up to 20 on Starter).
                </StyledText>
              </View>
            </View>
          ) : null}

          {/* Product Images Section */}
          <View style={styles.section}>
            <StyledText variant="labelMedium" children="Product Images" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageRow}
            >
              {/* Display selected images */}
              {currentProduct?.images &&
                currentProduct.images.length > 0 &&
                currentProduct.images.map((imageData: any, index: number) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: imageData.uri }}
                      style={styles.selectedImage}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        // Remove image from state
                        const updatedImages =
                          currentProduct?.images?.filter(
                            (_: any, i: number) => i !== index,
                          ) || [];
                        // Update the product using the hook method
                        handleProductUpdate({
                          field: "images",
                          value: updatedImages,
                        });
                      }}
                    >
                      <MaterialIcons name="close" size={15} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

              {/* Add image button - only show if less than 7 images */}
              {(!currentProduct?.images ||
                currentProduct.images.length < 7) && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={showImageSelectionModal}
                >
                  <MaterialIcons name="add-a-photo" size={24} color="gray" />
                  <StyledText variant="bodySmall" children="Add Images" />
                </TouchableOpacity>
              )}
            </ScrollView>
            <StyledText
              variant="labelSmall"
              style={styles.helperText}
              children="Add up to 7 images of your product. The first image will be the main display image."
            />
          </View>

          {/* Product Video Section */}
          <View style={styles.section}>
            <StyledText variant="labelMedium" children="Product Video" />

            {/* Display selected video with playback */}
            {currentProduct?.videos && (
              <View style={styles.videoContainer}>
                <VideoView
                  style={styles.videoPlayer}
                  player={videoPlayer}
                  fullscreenOptions={{ enable: true }}
                  allowsPictureInPicture
                  nativeControls={false}
                />

                {/* Custom Play/Pause Control */}
                <TouchableOpacity
                  style={styles.videoPlaybackOverlay}
                  onPress={() => {
                    if (videoPlayer) {
                      if (isPlaying) {
                        videoPlayer.pause();
                      } else {
                        videoPlayer.play();
                      }
                    }
                  }}
                >
                  {!isPlaying && (
                    <View style={styles.videoPlayButton}>
                      <MaterialIcons
                        name="play-circle-filled"
                        size={50}
                        color="white"
                      />
                      <StyledText
                        variant="bodySmall"
                        style={styles.videoLabel}
                        children="Tap to play"
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Remove Video Button */}
                <TouchableOpacity
                  style={styles.removeVideoButton}
                  onPress={() => {
                    // Pause video before removing
                    if (videoPlayer) {
                      videoPlayer.pause();
                    }
                    // Remove video from state using the hook method
                    handleProductUpdate({
                      field: "videos",
                      value: null,
                    });
                  }}
                >
                  <MaterialIcons name="close" size={15} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Add video button - only show if no video is selected */}
            {!currentProduct?.videos && (
              <TouchableOpacity
                style={styles.addVideoButton}
                onPress={showVideoSelectionModal}
              >
                <MaterialIcons name="videocam" size={24} color="gray" />
                <StyledText
                  variant="bodySmall"
                  style={{ color: "#000" }}
                  children="Add Video"
                />
              </TouchableOpacity>
            )}

            <StyledText
              variant="labelSmall"
              style={styles.helperText}
              children="Add a video showcasing your product (optional)"
            />
          </View>

          {/* Product Name Section */}
          <View style={styles.section}>
            <StyledTextInput
              value={currentProduct?.name || ""}
              onChangeText={(text) =>
                handleProductUpdate({ field: "name", value: text })
              }
              placeholder="Enter product name"
              label="Product Name *"
              info="Enter a clear and descriptive name for your product"
            />
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <StyledTextInput
              value={currentProduct?.description || ""}
              onChangeText={(text) =>
                handleProductUpdate({ field: "description", value: text })
              }
              placeholder="Enter product description"
              multiline
              numberOfLines={4}
              style={[
                styles.textArea,
                {
                  borderStyle: "dashed",
                },
              ]}
              label="Description *"
              info="Provide a quick description of your product for clarity"
            />
          </View>

          {/* Product Information Section */}
          <View style={styles.section}>
            <StyledTextInput
              value={currentProduct?.information || ""}
              onChangeText={(text) =>
                handleProductUpdate({ field: "information", value: text })
              }
              placeholder="Enter safety information, precautions, or additional product details"
              multiline
              numberOfLines={4}
              style={[
                styles.textArea,
                {
                  borderStyle: "dashed",
                },
              ]}
              label="Product Information"
              info="Optional: Add safety information, precautions, or any additional details customers should know about this product"
            />
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <StyledText variant="labelMedium" children="Product Category *" />
            <View style={styles.categoryContainer}>
              {isLoadingCategories ? (
                <StyledText
                  variant="bodySmall"
                  children="Loading categories..."
                />
              ) : categories && categories.length > 0 ? (
                categories.map(
                  (cat: TrendingCategoryInterface, index: number) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        currentProduct?.category_id === cat.id &&
                          styles.categoryButtonSelected,
                        { borderColor: borderColor },
                      ]}
                      onPress={() => {
                        const isSelected =
                          currentProduct?.category_id === cat.id;

                        if (isSelected) {
                          // Deselect category if already selected
                          handleProductUpdate({
                            field: "category_id",
                            value: undefined,
                          });
                        } else {
                          // Select this category
                          console.log(
                            "Selecting category:",
                            cat.title,
                            "with ID:",
                            cat.id,
                          );
                          handleProductUpdate({
                            field: "category_id",
                            value: cat.id,
                          });
                        }
                      }}
                    >
                      <StyledText variant="bodySmall" children={cat.title} />
                    </TouchableOpacity>
                  ),
                )
              ) : (
                <StyledText
                  variant="bodySmall"
                  children="No categories available"
                />
              )}
            </View>
            <StyledText
              variant="labelSmall"
              style={styles.helperText}
              children="Select the category that best describes your product (required)"
            />
          </View>

          {/* Size and Weight Section */}
          <View style={styles.section}>
            <StyledText
              variant="labelMedium"
              children="Product Size and Weight"
            />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  value={currentProduct?.size || ""}
                  onChangeText={(text) => {
                    const cleanedText = cleanSizeInput(text);
                    handleProductUpdate({ field: "size", value: cleanedText });
                  }}
                  placeholder="Enter size"
                  label="Size"
                  info="Uses * to separate the dimensions. click space to add a new dimension"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  value={currentProduct?.weight || ""}
                  onChangeText={(text) =>
                    handleProductUpdate({ field: "weight", value: text })
                  }
                  placeholder="Enter weight"
                  label="Weight"
                  info="Enter in grams "
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Price and Quantity Section */}
          <View style={styles.section}>
            <StyledText variant="labelMedium" children="Price and Quantity" />
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  value={currentProduct?.price?.toString() || ""}
                  onChangeText={(text) =>
                    handleProductUpdate({
                      field: "price",
                      value: isNaN(parseFloat(text)) ? "" : text,
                    })
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  label="Price *"
                  info="All product price should reflect vat"
                />
              </View>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  value={currentProduct?.quantity?.toString() || ""}
                  onChangeText={(text) =>
                    handleProductUpdate({
                      field: "quantity",
                      value: isNaN(parseInt(text)) ? "" : text,
                    })
                  }
                  placeholder="0"
                  keyboardType="number-pad"
                  label="Quantity"
                  info="Available stock quantity"
                />
              </View>

              <View ref={infoIconRef} collapsable={false}>
                <TouchableOpacity
                  onPress={handleShowPriceInfo}
                  style={styles.infoIconContainer}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={24}
                    color={iconColor}
                    style={styles.infoIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardWrapper>
    </View>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  formContainer: {
    gap: 12,
  },
  keyboardScrollContent: {
    paddingHorizontal: 10,
    gap: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    width: "100%",
  },
  listingFeeBanner: {
    alignItems: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 12,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#CECECE",
    paddingBottom: 5,
  },
  imageRow: {
    flexDirection: "row",
    marginVertical: 5,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addVideoButton: {
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    marginVertical: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    margin: 2,
    maxWidth: 100,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  categoryButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  subheading: {
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 8,
  },
  halfWidth: {
    flex: 1,
  },
  helperText: {
    color: "#666",
    marginTop: 4,
  },
  previewHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  previewHintText: {
    flex: 1,
    lineHeight: 18,
  },

  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 12,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderRadius: 8,
    marginVertical: 12,
    position: "relative",
    overflow: "hidden",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  videoPlaybackOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  videoPlayButton: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  videoLabel: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  removeVideoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "red",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoIconContainer: {
    position: "absolute",
    left: 110,
    bottom: 35,
    padding: 10,
    backgroundColor: "red",
  },
  infoIcon: {
    // Icon styles are inherited from the icon component
  },
  infoPopupContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
