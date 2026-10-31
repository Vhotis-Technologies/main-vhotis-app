import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import StyledText from "../../helpers/forms/StyledText";
import StyledButton from "../../helpers/buttons/StyledButton";
import KycModalComponent from "./kyc/KycModalComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import { FontAwesome5 } from "@expo/vector-icons";

const SellerKycComponent = () => {
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");

  const handleKycComplete = (documentType: string, images: string[]) => {
    console.log("KYC completed:", { documentType, images });
    // Handle the completed KYC process here
    // You can make API calls, update state, etc.
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Header Section */}
        <View
          style={[
            styles.header,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <View
            style={[styles.iconContainer, { backgroundColor: buttonColor }]}
          >
            <FontAwesome5 name="shield-alt" size={32} color="#fff" />
          </View>
          <StyledText
            variant="titleLarge"
            style={{
              color: textColor,
              fontWeight: "600",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Verify your identity
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={{
              color: textColor,
              opacity: 0.7,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Please submit the following documents to process your application.
          </StyledText>
        </View>

        {/* Requirements */}
        <View style={styles.requirementContainer}>
          <View
            style={[
              styles.requirement,
              { backgroundColor: cardBackground, borderColor },
            ]}
          >
            <View
              style={[
                styles.requirementIcon,
                { backgroundColor: buttonColor + "20" },
              ]}
            >
              <FontAwesome5 name="id-card" size={24} color={buttonColor} />
            </View>
            <View style={styles.requirementText}>
              <StyledText
                variant="titleSmall"
                style={{ color: textColor, fontWeight: "600" }}
              >
                Take a picture of a valid ID
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: textColor, opacity: 0.7, marginTop: 4 }}
              >
                To check your personal information is correct
              </StyledText>
            </View>
          </View>

          <View
            style={[
              styles.requirement,
              { backgroundColor: cardBackground, borderColor },
            ]}
          >
            <View
              style={[
                styles.requirementIcon,
                { backgroundColor: buttonColor + "20" },
              ]}
            >
              <FontAwesome5 name="user-circle" size={24} color={buttonColor} />
            </View>
            <View style={styles.requirementText}>
              <StyledText
                variant="titleSmall"
                style={{ color: textColor, fontWeight: "600" }}
              >
                Take a selfie of yourself
              </StyledText>
              <StyledText
                variant="bodySmall"
                style={{ color: textColor, opacity: 0.7, marginTop: 4 }}
              >
                To match your face to your Passport or ID photo
              </StyledText>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View
          style={[
            styles.securityNotice,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <FontAwesome5 name="lock" size={16} color={buttonColor} />
          <StyledText
            variant="bodySmall"
            style={{ color: textColor, opacity: 0.8, flex: 1, marginLeft: 12 }}
          >
            Your info will be encrypted and stored securely
          </StyledText>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <StyledButton
            variant="small"
            title="Get Started"
            onPress={() => setIsKycModalVisible(true)}
          />
        </View>
      </View>

      <KycModalComponent
        isVisible={isKycModalVisible}
        onClose={() => setIsKycModalVisible(false)}
        onComplete={handleKycComplete}
      />
    </View>
  );
};

export default SellerKycComponent;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 4,
    minHeight: 500,
  },
  content: {
    width: "100%",
    justifyContent: "center",
    gap: 24,
  },
  header: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementContainer: {
    width: "100%",
    gap: 16,
  },
  requirement: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
    alignItems: "center",
  },
  requirementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  requirementText: {
    flex: 1,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
});
