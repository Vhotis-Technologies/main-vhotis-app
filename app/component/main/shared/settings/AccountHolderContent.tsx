import { StyleSheet, View, Image } from "react-native";
import React from "react";
import { AccountHolderInterface } from "@/app/interfaces/main/profile/ProfileInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";

interface AccountHolderContentProps {
  accountHolder: AccountHolderInterface;
}

const AccountHolderContent = ({ accountHolder }: AccountHolderContentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof accountHolder.image === "string"
              ? { uri: accountHolder.image }
              : accountHolder.image
          }
          style={styles.accountImage}
        />
      </View>
      <View style={styles.textContainer}>
        <StyledText variant="titleMedium" style={styles.name}>
          {accountHolder.name}
        </StyledText>
        <StyledText variant="bodyMedium" style={styles.email}>
          {accountHolder.email}
        </StyledText>
      </View>
    </View>
  );
};

export default AccountHolderContent;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    marginBottom: 16,
  },
  accountImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  textContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
});
