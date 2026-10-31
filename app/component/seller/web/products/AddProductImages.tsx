import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ProductSideDetailsComponent from "./ProductSideDetailsComponent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import ImageSelectionModal from "@/app/component/helpers/others/ImageSelectionModal";
import { Image } from "expo-image";

const AddProductImages = ({ images }: { images: any[] }) => {
  const {
    showImageSelectionModal,
    handleCameraSelection,
    handleFileSelection,
    isImageModalVisible,
  } = useSellerInventory();

  return (
    <View style={styles.maincontainer}>
      <View style={styles.leftsection}>
        <ProductSideDetailsComponent
          title="Images"
          body="Make your products visible to customers by taking a clear and professional product image"
        />
      </View>
      <View style={styles.imagecontainer}>
        {Array.isArray(images) &&
          images.map((imageData, index) => {
            // Handle both old format (string URI) and new format (object with uri and file)
            const imageUri =
              typeof imageData === "string" ? imageData : imageData.uri;

            return (
              <Pressable style={styles.image} key={index}>
                <Image
                  source={
                    typeof imageUri === "string" ? { uri: imageUri } : imageUri
                  }
                  style={styles.imageStyle}
                />
              </Pressable>
            );
          })}
        <Pressable
          style={styles.addimagecontainer}
          onPress={showImageSelectionModal}
        >
          <StyledText variant="labelLarge" children="Add image" />
        </Pressable>
      </View>

      {/* Image Selection Modal */}
      <ImageSelectionModal
        isVisible={isImageModalVisible}
        onClose={showImageSelectionModal}
        onCameraPress={handleCameraSelection}
        onFilePress={handleFileSelection}
      />
    </View>
  );
};

export default AddProductImages;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  leftsection: {
    flex: 1,
    borderEndWidth: 1,
    borderColor: "white",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    boxShadow: "0px 0px 3px 3px rgba(251, 245, 245, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  imagecontainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 4,
    gap: 20,
    paddingVertical: 5,
    marginLeft: 10,
  },
  image: {
    borderRadius: 5,
    maxWidth: 150,
    maxHeight: 150,
    minWidth: 100,
    minHeight: 100,
    marginBottom: 10,
  },
  imageStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  addimagecontainer: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    borderStyle: "dashed",
    borderWidth: 1,
  },
});
