import { StyleSheet, View, Modal, TouchableOpacity } from "react-native";
import React from "react";
import StyledText from "../forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ImageSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onFilePress: () => void;
}

const ImageSelectionModal = ({
  isVisible,
  onClose,
  onCameraPress,
  onFilePress,
}: ImageSelectionModalProps) => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
          <View style={styles.header}>
            <StyledText variant="titleMedium" children="Select Image Source" />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <StyledText variant="titleLarge" children="✕" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={onCameraPress}
            >
              <StyledText
                children="📷"
                variant="titleLarge"
                style={styles.icon}
              />
              <StyledText
                children="Camera"
                variant="labelLarge"
                style={{ color: textColor }}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onFilePress}>
              <StyledText
                children="📁"
                variant="titleLarge"
                style={styles.icon}
              />
              <StyledText
                children="Photo Library"
                variant="labelLarge"
                style={{ color: textColor }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageSelectionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    gap: 15,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  icon: {
    marginRight: 15,
  },
});
