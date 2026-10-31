import { StyleSheet, View, Modal, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import StyledText from "../../../helpers/forms/StyledText";
import DocumentChoiceComponent from "./DocumentChoiceComponent";
import PassportUploadComponent from "./PassportUploadComponent";
import DriverLicenseUploadComponent from "./DriverLicenseUploadComponent";

type KycStep = "documentChoice" | "passportUpload" | "driverLicenseUpload";

interface KycModalComponentProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (documentType: string, images: string[]) => void;
}

const KycModalComponent: React.FC<KycModalComponentProps> = ({
  isVisible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<KycStep>("documentChoice");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleDocumentSelect = (documentType: "passport" | "driverLicense") => {
    setSelectedDocumentType(documentType);
    if (documentType === "passport") {
      setCurrentStep("passportUpload");
    } else {
      setCurrentStep("driverLicenseUpload");
    }
  };

  const handlePassportUploadComplete = (imageUri: string) => {
    setUploadedImages([imageUri]);
    // You can add additional logic here like validation or API calls
    setTimeout(() => {
      onComplete("passport", [imageUri]);
      handleClose();
    }, 1000);
  };

  const handleDriverLicenseUploadComplete = (
    frontImage: string,
    backImage: string
  ) => {
    setUploadedImages([frontImage, backImage]);
    // You can add additional logic here like validation or API calls
    setTimeout(() => {
      onComplete("driverLicense", [frontImage, backImage]);
      handleClose();
    }, 1000);
  };

  const handleBack = () => {
    if (
      currentStep === "passportUpload" ||
      currentStep === "driverLicenseUpload"
    ) {
      setCurrentStep("documentChoice");
      setSelectedDocumentType("");
      setUploadedImages([]);
    }
  };

  const handleClose = () => {
    setCurrentStep("documentChoice");
    setSelectedDocumentType("");
    setUploadedImages([]);
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "documentChoice":
        return (
          <DocumentChoiceComponent onDocumentSelect={handleDocumentSelect} />
        );
      case "passportUpload":
        return (
          <PassportUploadComponent
            onUploadComplete={handlePassportUploadComplete}
            onBack={handleBack}
          />
        );
      case "driverLicenseUpload":
        return (
          <DriverLicenseUploadComponent
            onUploadComplete={handleDriverLicenseUploadComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const getStepIndicator = () => {
    const steps = ["documentChoice", "upload"];
    const currentStepIndex = currentStep === "documentChoice" ? 0 : 1;

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepDot,
                index <= currentStepIndex
                  ? styles.stepDotActive
                  : styles.stepDotInactive,
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStepIndex
                    ? styles.stepLineActive
                    : styles.stepLineInactive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <StyledText variant="titleLarge">✕</StyledText>
            </TouchableOpacity>
            {getStepIndicator()}
          </View>

          <View style={styles.content}>{renderCurrentStep()}</View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default KycModalComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotActive: {
    backgroundColor: "#007AFF",
  },
  stepDotInactive: {
    backgroundColor: "#e0e0e0",
  },
  stepLine: {
    width: 30,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#007AFF",
  },
  stepLineInactive: {
    backgroundColor: "#e0e0e0",
  },
  content: {
    flex: 1,
  },
});
