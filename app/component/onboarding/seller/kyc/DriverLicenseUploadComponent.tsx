import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StyledText from "../../../helpers/forms/StyledText";
import { Button } from "react-native-paper";

interface DriverLicenseUploadComponentProps {
  onUploadComplete: (frontImage: string, backImage: string) => void;
  onBack: () => void;
}

const DriverLicenseUploadComponent: React.FC<
  DriverLicenseUploadComponentProps
> = ({ onUploadComplete, onBack }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleFrontImagePicker = () => {
    // TODO: Implement image picker functionality
    // For now, we'll simulate an upload
    const mockImageUri = "mock-front-image-uri";
    setFrontImage(mockImageUri);
    if (backImage) {
      onUploadComplete(mockImageUri, backImage);
    }
  };

  const handleBackImagePicker = () => {
    // TODO: Implement image picker functionality
    // For now, we'll simulate an upload
    const mockImageUri = "mock-back-image-uri";
    setBackImage(mockImageUri);
    if (frontImage) {
      onUploadComplete(frontImage, mockImageUri);
    }
  };

  return (
    <View style={styles.container}>
      <StyledText variant="titleMedium" style={styles.title} children="Upload Driver License" />
      <StyledText variant="bodySmall" style={styles.subtitle} children="Please upload clear photos of both sides of your driver license" />

      <View style={styles.uploadContainer}>
        <View style={styles.uploadRow}>
          <View style={styles.uploadColumn}>
            <StyledText variant="titleSmall" style={styles.uploadLabel} children="Front Side" />
            <TouchableOpacity
              style={[styles.uploadBox, frontImage && styles.uploadBoxFilled]}
              onPress={handleFrontImagePicker}
            >
              {frontImage ? (
                <View style={styles.imagePreview}>
                  <StyledText variant="bodySmall" style={styles.imageText} children="Front uploaded ✓" />
                </View>
              ) : (
                <View style={styles.uploadContent}>
                  <StyledText variant="titleLarge" style={styles.uploadIcon} children="📷" />
                  <StyledText variant="bodySmall" style={styles.uploadDescription} children="Front side" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.uploadColumn}>
            <StyledText variant="titleSmall" style={styles.uploadLabel} children="Back Side" />
            <TouchableOpacity
              style={[styles.uploadBox, backImage && styles.uploadBoxFilled]}
              onPress={handleBackImagePicker}
            >
              {backImage ? (
                <View style={styles.imagePreview}>
                  <StyledText variant="bodySmall" style={styles.imageText} children="Back uploaded ✓" />
                </View>
              ) : (
                <View style={styles.uploadContent}>
                  <StyledText variant="titleLarge" style={styles.uploadIcon} children="📷" />
                  <StyledText variant="bodySmall" style={styles.uploadDescription} children="Back side" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.requirementsContainer}>
        <StyledText variant="titleSmall" style={styles.requirementsTitle} children="Requirements:" />
        <View style={styles.requirementList}>
          <StyledText variant="bodySmall" style={styles.requirement} children="• Clear, well-lit photos of both sides" />
          <StyledText variant="bodySmall" style={styles.requirement} children="• All text and details must be readable" />
          <StyledText variant="bodySmall" style={styles.requirement} children="• No glare, shadows, or reflections" />
          <StyledText variant="bodySmall" style={styles.requirement} children="• License must be valid and not expired" />
          <StyledText variant="bodySmall" style={styles.requirement} children="• Both front and back sides are required" />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={onBack} children="Back" />
      </View>
    </View>
  );
};

export default DriverLicenseUploadComponent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    color: "#11181C",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  uploadContainer: {
    width: "100%",
    marginBottom: 32,
  },
  uploadRow: {
    flexDirection: "row",
    gap: 16,
  },
  uploadColumn: {
    flex: 1,
    alignItems: "center",
  },
  uploadLabel: {
    color: "#11181C",
    marginBottom: 12,
    textAlign: "center",
  },
  uploadBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    width: "100%",
  },
  uploadBoxFilled: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4CAF50",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadDescription: {
    color: "#666",
    textAlign: "center",
  },
  imagePreview: {
    alignItems: "center",
  },
  imageText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  requirementsContainer: {
    width: "100%",
    marginBottom: 32,
  },
  requirementsTitle: {
    color: "#11181C",
    marginBottom: 12,
  },
  requirementList: {
    gap: 8,
  },
  requirement: {
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
  },
  backButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  backButtonText: {
    color: "#666",
  },
});
