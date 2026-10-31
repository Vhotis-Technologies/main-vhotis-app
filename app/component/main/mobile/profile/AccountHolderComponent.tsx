import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { AccountHolderInterface } from "@/app/interfaces/main/profile/ProfileInterface";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { LinearGradient } from "expo-linear-gradient";

interface AccountHolderComponentProps {
  accountHolder: AccountHolderInterface;
  onViewAccount: () => void;
  onSwitchAccount: () => void;
  onSignOut: () => void;
}

const AccountHolderComponent = ({
  accountHolder,
  onViewAccount,
  onSwitchAccount,
  onSignOut,
}: AccountHolderComponentProps) => {
  const backgroundColor = useThemeColor({}, "background");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");

  return (
    <View style={[styles.maincontainer, { backgroundColor }]}>
      <View style={styles.container}>
        <Image
          source={
            typeof accountHolder.image === "string"
              ? { uri: accountHolder.image }
              : accountHolder.image
          }
          style={styles.image}
        />
        <View style={styles.innerContainer}>
          <StyledText style={styles.nameText} children={accountHolder.name} />
          <StyledText style={styles.emailText} children={accountHolder.email} />
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={onViewAccount}>
          <StyledText style={styles.viewText}>View</StyledText>
        </TouchableOpacity>
      </View>
      {/* Create a divider and add a new account holder by displaying the switch button
      and the sign out button */}
      <View style={styles.divider} />

      <View style={styles.bottomContainer}>
        <StyledText
          style={styles.signinAsText}
          children={`signed in as ${accountHolder.email}`}
        />
        <TouchableOpacity onPress={onSwitchAccount} style={[styles.button, {backgroundColor:secondaryButtonColor}]}>
          <StyledText style={styles.buttonText} children="Switch Account" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignOut} style={[styles.button, {backgroundColor:secondaryButtonColor}]}>
          <StyledText style={styles.buttonText} children="Sign Out" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountHolderComponent;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    padding: 10,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },

  innerContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 3,
    padding: 5,
  },

  nameText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.5,
    textTransform: "capitalize",
  },

  emailText: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "BarlowRegular",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginHorizontal: 5,
  },

  viewButton: {
    padding: 5,
    marginHorizontal: 5,
  },

  viewText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "BarlowRegular",
    textTransform: "capitalize",
  },

  divider: {
    marginVertical: 10,
    borderWidth: 0.2,
  },

  bottomContainer: {
    flexDirection: "column",
    gap: 10,
    marginTop: 10,
  },

  button: {
    padding: 8,
    borderRadius: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },  

  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "BarlowRegular",
    textTransform: "capitalize",
  },

  signinAsText: {
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    textTransform: "lowercase",
    letterSpacing: 0.4,
    lineHeight: 15,
  },
});
