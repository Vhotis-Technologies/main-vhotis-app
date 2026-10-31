import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import {
  ProductInterface,
  ProductReturnInterface,
} from "@/app/interfaces/seller/ProductInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useGetProductDetailsQuery } from "@/app/store/seller/api/inventoryApi";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import * as ExpoImagePicker from "expo-image-picker";
import ImageSelectionModal from "@/app/component/helpers/others/ImageSelectionModal";

interface ProductEditModalProps {
  productId: string | null;
  onSave: (updatedProduct: Partial<ProductReturnInterface>) => Promise<void>;
}

const ProductEditModal = ({ productId, onSave }: ProductEditModalProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const { closeModal } = useModalService();
  const { status: fulfillmentStatus } = useFulfillmentStatus();
  const warehouseManaged = fulfillmentStatus === "active";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductInterface>>({});
  const [images, setImages] = useState<
    Array<{
      uri: string;
      isExisting?: boolean;
      id?: string;
      file?: any;
      filename?: string;
      type?: string;
    }>
  >([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  // Fetch product details when productId is available
  const {
    data: product,
    isLoading: isLoadingProductDetails,
    error: productDetailsError,
  } = useGetProductDetailsQuery(productId || "", {
    skip: !productId,
  });

  // Helper function to convert URI to file format
  const uriToFile = async (
    uri: string,
    filename: string,
    mimeType: string = "image/jpeg"
  ): Promise<any> => {
    // For React Native, return file metadata directly
    if (Platform.OS !== "web") {
      return {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        name: filename,
        type: mimeType,
      };
    }

    // For web, use the old fetch/blob approach
    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Initialize form data and images when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        quantity: product.quantity || 0,
        category: product.category || "",
        size: product.size || "",
        weight: product.weight || "",
      });

      // Initialize images from product data
      if (product.images && Array.isArray(product.images)) {
        const existingImages = product.images.map((imageUrl: string) => ({
          uri: imageUrl,
          isExisting: true,
        }));
        setImages(existingImages);
      } else {
        setImages([]);
      }
    }
  }, [product]);

  const handleInputChange = (field: keyof ProductInterface, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image selection from camera or gallery
  const handleImageSelection = async (imageUri: string) => {
    try {
      // Generate a filename based on timestamp
      const timestamp = Date.now();
      const filename = `image_${timestamp}.jpg`;

      // Convert URI to File object or file metadata (for React Native)
      const imageFile = await uriToFile(imageUri, filename, "image/jpeg");

      // Create an object with URI, File, and type for React Native FormData
      const imageData = {
        uri: imageUri,
        file: imageFile,
        filename: filename,
        type: "image/jpeg",
        isExisting: false,
      };

      // Add new image to images array
      setImages((prev) => [...prev, imageData]);

      // Close the modal after successful selection
      setIsImageModalVisible(false);
    } catch (error) {
      console.error("Error converting image URI to File:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
    }
  };

  // Handle camera image capture
  const handleCameraSelection = async () => {
    // Request camera permissions first
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      setIsImageModalVisible(false);
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to make this work!"
      );
      return;
    }

    // Use InteractionManager to ensure all interactions are complete before launching picker
    InteractionManager.runAfterInteractions(async () => {
      try {
        let result = await ExpoImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          aspect: [4, 3],
          quality: 1,
        });

        // Close modal after picker completes
        setIsImageModalVisible(false);

        if (!result.canceled) {
          const image = result.assets[0].uri;
          await handleImageSelection(image);
        }
      } catch (error) {
        setIsImageModalVisible(false);
        console.error("Error launching camera:", error);
        Alert.alert("Error", "Failed to launch camera. Please try again.");
      }
    });
  };

  // Handle image selection from gallery
  const handleFileSelection = async () => {
    // Request media library permissions first
    const { status } =
      await ExpoImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setIsImageModalVisible(false);
      Alert.alert(
        "Permission Required",
        "Sorry, we need media library permissions to make this work!"
      );
      return;
    }

    // Use InteractionManager to ensure all interactions are complete before launching picker
    InteractionManager.runAfterInteractions(async () => {
      try {
        let result = await ExpoImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          aspect: [4, 3],
          quality: 1,
        });

        // Close modal after picker completes
        setIsImageModalVisible(false);

        if (!result.canceled) {
          const image = result.assets[0].uri;
          await handleImageSelection(image);
        }
      } catch (error) {
        setIsImageModalVisible(false);
        console.error("Error launching image library:", error);
        Alert.alert("Error", "Failed to open image library. Please try again.");
      }
    });
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Edit",
      "Are you sure you want to cancel? Any unsaved changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: closeModal },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Include images in the formData to be sent to onSave
      await onSave({ ...formData, images });
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching product details
  if (isLoadingProductDetails) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <StyledText style={styles.loadingText}>
            Loading product details...
          </StyledText>
        </View>
      </View>
    );
  }

  // Show error state if product details failed to load
  if (productDetailsError || !product) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF5722" />
          <StyledText style={styles.errorText}>
            Failed to load product details
          </StyledText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => closeModal()}
          >
            <StyledText style={styles.retryButtonText}>Close</StyledText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.contentContainer}>
          {warehouseManaged ? (
            <View
              style={[
                styles.warehouseBanner,
                { backgroundColor: `${buttonColor}14`, borderColor },
              ]}
            >
              <StyledText variant="bodySmall" style={{ color: textColor }}>
                Price, category, and stock are managed via inbound manifests.
                You can update description and images here.
              </StyledText>
            </View>
          ) : null}

          {/* Basic Information */}
          <View style={styles.section}>
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Basic Information
            </StyledText>

            <StyledTextInput
              label="Product Name"
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              style={styles.input}
            />

            <StyledTextInput
              label="Description"
              placeholder="Enter product description"
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              multiline={true}
              numberOfLines={4}
              style={styles.input}
            />

            <StyledTextInput
              label="Category"
              placeholder="Enter product category"
              value={formData.category}
              onChangeText={(text) => handleInputChange("category", text)}
              style={styles.input}
              editable={!warehouseManaged}
            />
          </View>

          {/* Pricing and Inventory */}
          <View style={styles.section}>
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Pricing & Inventory
            </StyledText>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  label="Price ($)"
                  placeholder="0.00"
                  value={formData.price?.toString()}
                  onChangeText={(text) =>
                    handleInputChange("price", parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  editable={!warehouseManaged}
                />
              </View>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  label="Quantity"
                  placeholder="0"
                  value={formData.quantity?.toString()}
                  onChangeText={(text) =>
                    handleInputChange("quantity", parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                  style={styles.input}
                  editable={!warehouseManaged}
                />
              </View>
            </View>
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Specifications
            </StyledText>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  label="Size"
                  placeholder="e.g., Small, Medium, Large"
                  value={formData.size}
                  onChangeText={(text) => handleInputChange("size", text)}
                  style={styles.input}
                />
              </View>
              <View style={styles.halfWidth}>
                <StyledTextInput
                  label="Weight"
                  placeholder="e.g., 1.5 kg"
                  value={formData.weight}
                  onChangeText={(text) => handleInputChange("weight", text)}
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* Product Images */}
          <View style={styles.section}>
            <StyledText
              variant="titleMedium"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Product Images
            </StyledText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
              contentContainerStyle={styles.imageScrollContent}
              nestedScrollEnabled={true}
            >
              {/* Display existing and new images */}
              {images.map((imageData, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageData.uri }}
                    style={styles.selectedImage}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <MaterialIcons name="close" size={15} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add image button - only show if less than 7 images */}
              {images.length < 7 && (
                <TouchableOpacity
                  style={[styles.addImageButton, { borderColor }]}
                  onPress={() => setIsImageModalVisible(true)}
                >
                  <MaterialIcons
                    name="add-a-photo"
                    size={24}
                    color={textColor}
                  />
                  <StyledText
                    variant="bodySmall"
                    style={{ color: textColor, marginTop: 4 }}
                  >
                    Add Images
                  </StyledText>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton, { borderColor }]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            Cancel
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.saveButton,
            { backgroundColor: buttonColor },
            isLoading && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" />
              <StyledText variant="labelLarge" style={styles.buttonText}>
                Save Changes
              </StyledText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Selection Modal - Outside ScrollView */}
      <ImageSelectionModal
        isVisible={isImageModalVisible}
        onClose={() => setIsImageModalVisible(false)}
        onCameraPress={handleCameraSelection}
        onFilePress={handleFileSelection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 20,
  },
  warehouseBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "transparent",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  saveButton: {
    borderWidth: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imageScrollView: {
    marginTop: 8,
  },
  imageScrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductEditModal;
