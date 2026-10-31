import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import AddressAutocompleteInput, {
  ResolvedAddressPayload,
} from "../../helpers/forms/AddressAutocompleteInput";
import AddressComponent from "../../main/mobile/home/AddressComponent";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { LinearGradient } from "expo-linear-gradient";
import StyledButton from "../../helpers/buttons/StyledButton";
import {
  getPlaceDetails,
  getPlacePredictions,
  parseAddressComponents,
} from "@/app/_utils/places";
import {
  useGetAllAddressesQuery,
  useAddDeliveryAddressMutation,
  useSetDefaultDeliveryAddressMutation,
} from "@/app/store/main/api/profileApi";

interface ShippingFormProps {
  initialAddress?: DeliveryAddress;
  onSubmit: (address: DeliveryAddress) => void;
}

const ShippingForm = ({ initialAddress, onSubmit }: ShippingFormProps) => {
  const backgroundColor = useThemeColor({}, "background");

  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");

  // Fetch addresses from server
  const {
    data: addresses = [],
    isLoading,
    error,
    refetch,
  } = useGetAllAddressesQuery();
  const [addDeliveryAddress, { isLoading: isSaving }] =
    useAddDeliveryAddressMutation();
  const [setDefaultDeliveryAddress, { isLoading: isSettingDefault }] =
    useSetDefaultDeliveryAddressMutation();

  const persistDefaultAddress = async (address: DeliveryAddress) => {
    if (!address.id || address.default) {
      return address;
    }

    const result = await setDefaultDeliveryAddress({
      address_id: address.id,
    }).unwrap();
    return result.delivery_address;
  };

  const [address, setAddress] = useState<DeliveryAddress>(
    initialAddress || {
      delivery_name: "",
      address: "",
      city: "",
      zip_code: "",
      country: "",
    }
  );

  const [selectedSavedAddress, setSelectedSavedAddress] =
    useState<DeliveryAddress | null>(null);
  const [addressSearchText, setAddressSearchText] = useState<string>(
    initialAddress?.address || ""
  );
  const didAutoSelectDefault = useRef(false);

  useEffect(() => {
    if (initialAddress?.id) {
      setSelectedSavedAddress(initialAddress);
      setAddress(initialAddress);
      setAddressSearchText(initialAddress.address || "");
      didAutoSelectDefault.current = true;
      return;
    }

    if (didAutoSelectDefault.current || addresses.length === 0) {
      return;
    }

    const serverDefault =
      addresses.find((item) => item.default) ?? addresses[0];
    if (serverDefault) {
      setSelectedSavedAddress(serverDefault);
      setAddress(serverDefault);
      setAddressSearchText(serverDefault.address || "");
      didAutoSelectDefault.current = true;
    }
  }, [addresses, initialAddress]);

  const handleChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev: DeliveryAddress) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressResolved = (resolved: ResolvedAddressPayload) => {
    setAddress((prev: DeliveryAddress) => ({
      ...prev,
      address: resolved.addressLine1 || "",
      city: resolved.city || "",
      zip_code: resolved.postcode || "",
      country: resolved.country || "",
      latitude:
        typeof resolved.latitude === "number" ? resolved.latitude : prev.latitude,
      longitude:
        typeof resolved.longitude === "number"
          ? resolved.longitude
          : prev.longitude,
    }));
    setAddressSearchText(resolved.addressLine1 || "");
  };

  const handleSubmit = async () => {
    try {
      if (selectedSavedAddress) {
        const defaultAddress = await persistDefaultAddress(selectedSavedAddress);
        onSubmit(defaultAddress);
        return;
      }

      let nextAddress: DeliveryAddress = { ...address };

      // Fallback: if user typed an address but did not tap a suggestion,
      // resolve the address via Places before submitting.
      const missingLocationFields =
        !nextAddress.city || !nextAddress.zip_code || !nextAddress.country;
      if (missingLocationFields && addressSearchText.trim().length >= 3) {
        const predictions = await getPlacePredictions(addressSearchText.trim());
        const topPrediction = predictions?.[0];
        if (topPrediction?.place_id) {
          const details = await getPlaceDetails(topPrediction.place_id);
          if (details) {
            const parsed = parseAddressComponents(details);
            nextAddress = {
              ...nextAddress,
              address: parsed.address || nextAddress.address,
              city: parsed.city || nextAddress.city,
              zip_code: parsed.zip_code || nextAddress.zip_code,
              country: parsed.country || nextAddress.country,
              latitude:
                Number.isFinite(parsed.latitude) ? parsed.latitude : nextAddress.latitude,
              longitude:
                Number.isFinite(parsed.longitude)
                  ? parsed.longitude
                  : nextAddress.longitude,
            };
            setAddress(nextAddress);
            setAddressSearchText(nextAddress.address || addressSearchText);
          }
        }
      }

      const result = await addDeliveryAddress(nextAddress).unwrap();

      const savedAddress = result.delivery_address;
      const defaultAddress = await persistDefaultAddress(savedAddress);
      onSubmit(defaultAddress);

      // Refetch addresses to update the list
      refetch();
    } catch (error: any) {
      console.error("Failed to save address:", error);
      // You might want to show an error message to the user here
      alert(error?.data?.error || "Failed to save address. Please try again.");
    }
  };

  const handleSelectPreviousAddress = (selectedAddress: DeliveryAddress) => {
    console.log("Selected existing address:", selectedAddress);
    console.log("Address ID:", selectedAddress.id);
    setSelectedSavedAddress(selectedAddress);
    setAddress(selectedAddress);
    setAddressSearchText(selectedAddress.address || "");
  };

  const handleClearSelection = () => {
    setSelectedSavedAddress(null);
    setAddress({
      delivery_name: "",
      address: "",
      city: "",
      zip_code: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    });
    setAddressSearchText("");
  };

  return (
    <View style={[styles.container, { backgroundColor , borderColor}]}>
      <StyledText style={styles.title} children="Shipping Address" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={buttonColor} />
          <StyledText style={[styles.loadingText, { color: textColor }]}>
            Loading addresses...
          </StyledText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <StyledText style={[styles.errorText, { color: "red" }]}>
            Failed to load addresses. Please try again.
          </StyledText>
        </View>
      ) : addresses.length > 0 ? (
        <View style={styles.previousAddressesContainer}>
          <StyledText
            style={styles.subtitle}
            children="Select a saved address:"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addressScrollContent}
            nestedScrollEnabled={true}
          >
            {addresses.map((addr, index) => (
              <AddressComponent
                key={addr.id || index}
                props={addr}
                onPress={handleSelectPreviousAddress}
                isSelected={selectedSavedAddress?.id === addr.id}
                isDefault={!!addr.default}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {selectedSavedAddress && (
        <View
          style={[
            styles.selectedAddressContainer,
          ]}
        >
          <StyledText style={styles.subtitle} children="Selected Address:" />
          <View style={styles.selectedAddressInfo}>
            <StyledText style={styles.selectedAddressText}>
              {selectedSavedAddress.delivery_name}
            </StyledText>
            <StyledText style={styles.selectedAddressText}>
              {selectedSavedAddress.address}
            </StyledText>
            <StyledText style={styles.selectedAddressText}>
              {selectedSavedAddress.city}, {selectedSavedAddress.zip_code}{" "}
              {selectedSavedAddress.country}
            </StyledText>
          </View>
          <TouchableOpacity
            onPress={handleClearSelection}
            style={styles.clearButton}
          >
            <StyledText style={styles.clearButtonText}>
              Use Different Address
            </StyledText>
          </TouchableOpacity>
        </View>
      )}

      {!selectedSavedAddress && (
        <>
          <StyledText
            style={styles.subtitle}
            children="Or enter a new address:"
          />

          <View style={styles.inputContainer}>
            <StyledTextInput
              label="Full Name"
              value={address.delivery_name}
              onChangeText={(value) => handleChange("delivery_name", value)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <AddressAutocompleteInput
              label="Address Line 1"
              value={addressSearchText}
              onChangeText={(value) => {
                setAddressSearchText(value);
                handleChange("address", value);
              }}
              placeholder="Street address"
              onAddressResolved={handleAddressResolved}
            />
          </View>

          <View style={styles.inputContainer}>
            <StyledTextInput
              label="Address Line 2 (Optional)"
              value={address.address2}
              onChangeText={(value) => handleChange("address2", value)}
              placeholder="Apartment, suite, etc."
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <StyledTextInput
                label="City"
                value={address.city}
                onChangeText={(value) => handleChange("city", value)}
                placeholder="City"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <StyledTextInput
                label="Postal Code"
                value={address.zip_code}
                onChangeText={(value) => handleChange("zip_code", value)}
                placeholder="Postal code"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <StyledTextInput
                label="Country"
                value={address.country}
                onChangeText={(value) => handleChange("country", value)}
                placeholder="Country"
              />
            </View>
          </View>
        </>
      )}

      <StyledButton
        title={
          isSaving || isSettingDefault
            ? "Saving..."
            : selectedSavedAddress
            ? "Use Selected Address"
            : "Save & Continue"
        }
        onPress={handleSubmit}
        variant="tonal"
        buttonStyles={styles.button}
        disabled={isSaving || isSettingDefault}
      />
    </View>
  );
};

export default ShippingForm;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    color: "#666",
  },
  previousAddressesContainer: {
    marginBottom: 24,
  },
  addressScrollContent: {
    paddingBottom: 8,
  },
  selectedAddressContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedAddressInfo: {
    marginBottom: 16,
  },
  selectedAddressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  clearButton: {
    alignSelf: "flex-start",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});
