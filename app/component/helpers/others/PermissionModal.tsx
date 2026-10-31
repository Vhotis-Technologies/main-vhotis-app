import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "../forms/StyledText";
import StyledButton from "../buttons/StyledButton";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PermissionModalProps {
  onRequestPermissions: () => void;
  hasLocation: boolean;
  hasNotifications: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  onRequestPermissions,
  hasLocation,
  hasNotifications,
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const errorColor = "#EF4444";
  const successColor = "#10B981";

  const allPermissionsGranted = hasLocation && hasNotifications;

  return (
    <View style={[styles.container]}>
      <StyledText
        variant="titleLarge"
        style={[styles.title, { color: textColor }]}
      >
        {allPermissionsGranted ? "All Set!" : "Permissions Required"}
      </StyledText>

      {/* Permission Items */}
      <View style={styles.permissionsContainer}>
        <PermissionItem
          icon="location"
          title="Location Services"
          description="Find nearby stores and calculate delivery fees"
          granted={hasLocation}
          textColor={textColor}
          successColor={successColor}
          errorColor={errorColor}
        />

        <PermissionItem
          icon="notifications"
          title="Notifications"
          description="Receive order updates and delivery notifications"
          granted={hasNotifications}
          textColor={textColor}
          successColor={successColor}
          errorColor={errorColor}
        />
      </View>

      {/* Warning Message */}
      {!allPermissionsGranted && (
        <View
          style={[
            styles.warningContainer,
            { backgroundColor: errorColor + "15" },
          ]}
        >
          <Ionicons name="warning-outline" size={20} color={errorColor} />
          <StyledText
            variant="bodySmall"
            style={[styles.warningText, { color: errorColor }]}
          >
            Without these permissions, you won't be able to use the app.
          </StyledText>
        </View>
      )}

      {/* Action Button */}
      <StyledButton
        variant="tonal"
        onPress={onRequestPermissions}
        title={allPermissionsGranted ? "Continue" : "Grant Permissions"}
      />

      {/* Info Text */}
      <StyledText
        variant="bodySmall"
        style={[styles.infoText, { color: textColor, opacity: 0.5 }]}
      >
        You can change these permissions anytime in your device settings.
      </StyledText>
    </View>
  );
};

interface PermissionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  granted: boolean;
  textColor: string;
  successColor: string;
  errorColor: string;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  icon,
  title,
  description,
  granted,
  textColor,
  successColor,
  errorColor,
}) => {
  return (
    <View style={styles.permissionItem}>
      <View style={styles.permissionIcon}>
        <Ionicons name={icon} size={24} color={textColor} />
      </View>

      <View style={styles.permissionContent}>
        <StyledText variant="labelLarge" style={{ color: textColor }}>
          {title}
        </StyledText>
        <StyledText
          variant="bodySmall"
          style={[
            styles.permissionDescription,
            { color: textColor, opacity: 0.6 },
          ]}
        >
          {description}
        </StyledText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: "100%",
    alignSelf: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    padding: 10,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    flex: 1,
  },
  permissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  permissionDescription: {
    lineHeight: 18,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginBottom: 16,
  },
  infoText: {
    textAlign: "center",
    lineHeight: 18,
  },
});

export default PermissionModal;
