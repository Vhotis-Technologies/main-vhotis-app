import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { Button, Checkbox } from "react-native-paper";

interface ChangePasswordContentProps {
  onSave: (passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

const ChangePasswordContent = ({ onSave }: ChangePasswordContentProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwords.confirmPassword !== passwords.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(passwords);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <StyledTextInput
          label="Current Password"
          value={passwords.currentPassword}
          onChangeText={(text) =>
            setPasswords({ ...passwords, currentPassword: text })
          }
          info={errors.currentPassword}
          secureTextEntry={!showPassword}
        />
      </View>

      <View style={styles.inputGroup}>
        <StyledTextInput
          label="New Password"
          value={passwords.newPassword}
          onChangeText={(text) =>
            setPasswords({ ...passwords, newPassword: text })
          }
          info={errors.newPassword}
          secureTextEntry={!showPassword}
        />
      </View>

      <View style={styles.inputGroup}>
        <StyledTextInput
          label="Confirm New Password"
          value={passwords.confirmPassword}
          onChangeText={(text) =>
            setPasswords({ ...passwords, confirmPassword: text })
          }
          info={errors.confirmPassword}
          secureTextEntry={!showPassword}
        />
      </View>

      {/* Display this checkbox if the platform is either ios or android */}
      {(Platform.OS === "ios" || Platform.OS === "android") && (
        <View style={styles.checkboxContainer}>
          <Checkbox.Android
            status={showPassword ? "checked" : "unchecked"}
            onPress={() => setShowPassword(!showPassword)}
          />
          <StyledText variant="bodyMedium">Show Password</StyledText>
        </View>
      )}

      <Button mode="contained-tonal" onPress={handleSubmit}>
        Update Password
      </Button>
    </View>
  );
};

export default ChangePasswordContent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: "#666",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
});
