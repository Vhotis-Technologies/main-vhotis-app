import { StyleSheet, View, TouchableOpacity } from "react-native";
import React from "react";
import StyledText from "../../../helpers/forms/StyledText";

interface DocumentChoiceComponentProps {
  onDocumentSelect: (documentType: "passport" | "driverLicense") => void;
}

const DocumentChoiceComponent: React.FC<DocumentChoiceComponentProps> = ({
  onDocumentSelect,
}) => {
  return (
    <View style={styles.container}>
      <StyledText
        variant="titleMedium"
        style={{ marginBottom: 10 }}
        children="Choose your document type"
      />
      <StyledText
        variant="bodySmall"
        style={{ marginVertical: 10 }}
        children="Select the type of document you want to use for verification"
      />

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => onDocumentSelect("passport")}
        >
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              <StyledText variant="titleLarge" children="🪪" />
            </View>
            <View style={styles.textContainer}>
              <StyledText variant="titleSmall" style={styles.optionTitle} children="Passport" />
              <StyledText variant="bodySmall" style={styles.optionDescription} children="Upload your passport data page" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => onDocumentSelect("driverLicense")}
        >
          <View style={styles.optionContent}>
            <View style={styles.iconContainer}>
              <StyledText variant="titleLarge">🚗</StyledText>
            </View>
            <View style={styles.textContainer}>
              <StyledText variant="titleSmall" style={styles.optionTitle}>
                Driver License
              </StyledText>
              <StyledText variant="bodySmall" style={styles.optionDescription}>
                Upload front and back of your driver license
              </StyledText>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentChoiceComponent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  optionsContainer: {
    width: "100%",
    gap: 16,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    color: "#11181C",
    marginBottom: 4,
  },
  optionDescription: {
    color: "#666",
  },
});
