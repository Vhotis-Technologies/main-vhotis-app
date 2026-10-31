import StyledText from "@/app/component/helpers/forms/StyledText";
import {
  OrderDeliveryAddressInterface,
  DetailedOrderDeliveryAddressInterface,
} from "@/app/interfaces/seller/orders/OrdersInterface";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MobileOrderDeliveryAddressProps {
  address?:
    | DetailedOrderDeliveryAddressInterface
    | OrderDeliveryAddressInterface;
  // Legacy props for backward compatibility
  name?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  zip?: string;
}

const MobileOrderDeliveryAddress = ({
  address: addressData,
  name,
  addressLine: legacyAddress,
  city: legacyCity,
  state: legacyState,
  zip: legacyZip,
}: MobileOrderDeliveryAddressProps) => {
  // Use detailed address if available, otherwise fall back to legacy props
  const isDetailedAddress = addressData && "delivery_name" in addressData;

  const displayName = isDetailedAddress ? addressData.delivery_name : name;
  const displayAddress = isDetailedAddress
    ? addressData.address
    : legacyAddress;
  const displayCity = isDetailedAddress ? addressData.city : legacyCity;
  const displayState = isDetailedAddress ? addressData.country : legacyState;
  const displayZip = isDetailedAddress ? addressData.zip_code : legacyZip;
  const address2 = isDetailedAddress ? addressData.address2 : null;

  return (
    <View style={styles.container}>
      <StyledText variant="labelMedium" children="Delivery Address" />
      <View style={styles.section}>
        <StyledText variant="bodySmall" children={displayName} />
        <StyledText variant="bodySmall" children={displayAddress} />
        {address2 && <StyledText variant="bodySmall" children={address2} />}
        <StyledText variant="bodySmall" children={displayCity} />
        <StyledText variant="bodySmall" children={displayState} />
        <StyledText variant="bodySmall" children={displayZip} />
      </View>
    </View>
  );
};

export default MobileOrderDeliveryAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 5,
    padding: 5,
    gap: 5,
  },
  section: {
    marginHorizontal: 5,
    padding: 5,
    gap: 2,
  },
});
