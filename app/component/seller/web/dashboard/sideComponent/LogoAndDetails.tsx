import StyledText from "@/app/component/helpers/forms/StyledText";
import { LogoAndDetailsInterface } from "@/app/interfaces/seller/StoreInterfaces";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const LogoAndDetails = ({
  image,
  business_name,
  business_city,
}: LogoAndDetailsInterface) => {
  
  return (
    <View style={styles.mainContainer}>
      <View style={styles.sellerSection}>
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          style={styles.userImage}
        />
        <View style={styles.nameContainer}>
          <StyledText
            variant="titleMedium"
            style={{ fontWeight: "700", textTransform: "capitalize" }}
            children={business_name}
          />
        </View>
      </View>
      <View style={styles.businessDetails}>
        <StyledText variant="bodySmall" children={business_city} />
      </View>
    </View>
  );
};

export default LogoAndDetails;

const styles = StyleSheet.create({
  mainContainer: {
    marginVertical: 5,
    paddingBottom: 15,
  },
  userImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "white",
  },
  sellerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  nameContainer: {
    flex: 1,
  },
  businessDetails: {
    marginTop: 15,
    gap: 8,
    paddingLeft: 5,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
