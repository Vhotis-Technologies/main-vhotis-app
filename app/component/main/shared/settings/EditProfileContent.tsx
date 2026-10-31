import {
  StyleSheet,
  View,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { AccountHolderInterface } from "@/app/interfaces/main/profile/ProfileInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { useThemeColor } from "@/hooks/useThemeColor";

interface EditProfileContentProps {
  accountHolder: AccountHolderInterface;
  onSave: (updatedProfile: AccountHolderInterface) => void;
  onChangePhoto: () => void;
}

const EditProfileContent = ({
  accountHolder,
  onSave,
  onChangePhoto,
}: EditProfileContentProps) => {
  const [profile, setProfile] = useState<AccountHolderInterface>(accountHolder);

  const secondaryButtonColor = useThemeColor({}, "secondaryButton");

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof profile.image === "string"
              ? { uri: profile.image }
              : profile.image
          }
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.changePhotoButton}
          onPress={onChangePhoto}
        >
          <StyledText variant="bodyMedium" style={styles.changePhotoText}>
            Change Photo
          </StyledText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <StyledTextInput
          style={styles.input}
          value={profile.name}
          label="Name"
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <StyledTextInput
          style={styles.input}
          value={profile.email}
          label="Email"
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: secondaryButtonColor }]}
        onPress={() => onSave(profile)}
      >
        <StyledText variant="bodyMedium" children="Save Changes" />
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileContent;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoButton: {
    padding: 8,
  },
  changePhotoText: {
    color: "#007AFF",
    fontWeight: "500",
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
  saveButton: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
});
