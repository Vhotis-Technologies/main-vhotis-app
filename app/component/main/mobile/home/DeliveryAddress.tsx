/**
 * DeliveryAddressComponent
 *
 * Saved delivery address list for the center address modal.
 */
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import AddressComponent from "./AddressComponent";
import { useGetAllAddressesQuery } from "@/app/store/main/api/profileApi";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";

const DeliveryAddressComponent = ({
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  isUpdatingDefault = false,
}: {
  selectedAddressId?: string;
  onSelectAddress: (address: DeliveryAddress) => void | Promise<void>;
  onAddNewAddress: () => void;
  isUpdatingDefault?: boolean;
}) => {
  const [activeAddressId, setActiveAddressId] = useState<string | undefined>(
    selectedAddressId
  );

  const {
    data: addresses = [],
    isLoading,
    error,
  } = useGetAllAddressesQuery();

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");

  useEffect(() => {
    setActiveAddressId(selectedAddressId);
  }, [selectedAddressId]);

  const handleAddressSelect = (address: DeliveryAddress) => {
    if (isUpdatingDefault) return;
    setActiveAddressId(address.id);
    onSelectAddress(address);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText style={{ color: textColor, marginTop: 12 }}>
          Loading addresses...
        </StyledText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={36} color="#E53935" />
        <StyledText style={{ color: textColor, marginTop: 8, textAlign: "center" }}>
          Failed to load addresses.
        </StyledText>
        <Pressable onPress={onAddNewAddress} style={styles.textAction}>
          <StyledText style={{ color: tintColor, fontWeight: "600" }}>
            Add a new address
          </StyledText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="location-off" size={40} color={borderColor} />
          <StyledText style={{ color: textColor, marginTop: 8, textAlign: "center" }}>
            No saved addresses
          </StyledText>
        </View>
      ) : (
        <View style={styles.list}>
          {addresses.map((address, index) => (
            <AddressComponent
              key={address.id || String(index)}
              props={address}
              onPress={handleAddressSelect}
              isSelected={
                !!address.id && activeAddressId === address.id
              }
              isDefault={!!address.default}
            />
          ))}
          {isUpdatingDefault ? (
            <View style={styles.updatingRow}>
              <ActivityIndicator size="small" color={tintColor} />
              <StyledText style={{ color: textColor, opacity: 0.7 }}>
                Updating default address...
              </StyledText>
            </View>
          ) : null}
        </View>
      )}

      <Pressable
        onPress={onAddNewAddress}
        style={[styles.addButton, { borderTopColor: borderColor }]}
      >
        <MaterialIcons name="add" size={20} color={tintColor} />
        <StyledText style={{ color: tintColor, fontWeight: "600" }}>
          Add New Address
        </StyledText>
      </Pressable>
    </View>
  );
};

export default DeliveryAddressComponent;

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  list: {
    gap: 8,
  },
  updatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  centerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  textAction: {
    marginTop: 8,
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
