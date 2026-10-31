import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity, 
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledTextInput from "../forms/StyledTextInput";
import StyledText from "../forms/StyledText";
import { useAlertContext } from "@/app/contexts/AlertContext";

const PasswordSettingComponent = () => {
  const cardColor = useThemeColor({}, "cards");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const { setAlertConfig, setIsVisible } = useAlertContext();

  const handlePasswordChange = () => {
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlertConfig({
        title: "Error",
        message: "Please fill in all password fields",
        type: "error",
        isVisible: true,
        onClose: () => setIsVisible(false),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({
        title: "Error",
        message: "New passwords do not match",
        type: "error",
        isVisible: true,
        onClose: () => setIsVisible(false),
      });
      return;
    }

    if (newPassword.length < 8) {
      setAlertConfig({
        title: "Error",
        message: "Password must be at least 8 characters long",
        type: "error",
        isVisible: true,
        onClose: () => setIsVisible(false),
      });
      return;
    }

    // TODO: Implement actual password change logic here
    setAlertConfig({
      title: "Success",
      message: "Password updated successfully",
      type: "success",
      isVisible: true,
      onClose: () => setIsVisible(false),
    });
    // Clear fields after successful update
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <StyledText variant="titleSmall" style={styles.title}>Change Password</StyledText>

      <View style={styles.inputContainer}>
        <StyledTextInput
          style={styles.input}
          placeholder="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />

        <StyledTextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />

        <StyledTextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />
        {/* Show password not matching */}
        {newPassword !== confirmPassword && (
          <StyledText style={styles.errorText}>Passwords do not match</StyledText>
        )}
      </View>

      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <StyledText style={[styles.showPasswordText]}>
          {showPassword ? "Hide Password" : "Show Password"}
        </StyledText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handlePasswordChange}
      >
        <Text style={styles.updateButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordSettingComponent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingBottom: 30,
    marginTop: 15,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: "2px 3px 5px 0 rgba(128, 122, 122, 0.1)",
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 4,
      },
    }),
    },
  title: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
  },
  showPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  showPasswordText: {
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
