import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import StyledText from "../../../helpers/forms/StyledText";
import { Button } from "react-native-paper";

interface PassportUploadComponentProps {
  onUploadComplete: (imageUri: string) => void;
  onBack: () => void;
}

const PassportUploadComponent: React.FC<PassportUploadComponentProps> = ({
  onUploadComplete,
  onBack,
}) => {
  const [passportImage, setPassportImage] = useState<string | null>(null);

  const handleImagePicker = () => {
    // TODO: Implement image picker functionality
    // For now, we'll simulate an upload
    const mockImageUri = "mock-passport-image-uri";
    setPassportImage(mockImageUri);
    onUploadComplete(mockImageUri);
  };

  return (
    <View style={styles.container}>
      <StyledText variant="titleMedium" style={styles.title} children="Upload Passport Data Page" />
      <StyledText variant="bodySmall" style={styles.subtitle} children="Please upload a clear photo of your passport data page" />

      <View style={styles.uploadContainer}>
        <TouchableOpacity
          style={[styles.uploadBox, passportImage && styles.uploadBoxFilled]}
          onPress={handleImagePicker}
        >
          {passportImage ? (
            <View style={styles.imagePreview}>
              <StyledText variant="bodySmall" style={styles.imageText} children="Passport uploaded ✓" />
            </View>
          ) : (
            <View style={styles.uploadContent}>
              <StyledText variant="titleLarge" style={styles.uploadIcon}>
                📷
              </StyledText>
              <StyledText variant="titleSmall" style={styles.uploadTitle}>
                Tap to upload
              </StyledText>
              <StyledText variant="bodySmall" style={styles.uploadDescription}>
                Take a photo or select from gallery
              </StyledText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.requirementsContainer}>
        <StyledText variant="titleSmall" style={styles.requirementsTitle}>
          Requirements:
        </StyledText>
        <View style={styles.requirementList}>
          <StyledText variant="bodySmall" style={styles.requirement}>
            • Clear, well-lit photo of the data page
          </StyledText>
          <StyledText variant="bodySmall" style={styles.requirement}>
            • All text must be readable
          </StyledText>
          <StyledText variant="bodySmall" style={styles.requirement}>
            • No glare or shadows
          </StyledText>
          <StyledText variant="bodySmall" style={styles.requirement}>
            • Passport must be valid and not expired
          </StyledText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={onBack} children="Back" />
      </View>
    </View>
  );
};

export default PassportUploadComponent;

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
  uploadBox: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  uploadBoxFilled: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4CAF50",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    color: "#11181C",
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
