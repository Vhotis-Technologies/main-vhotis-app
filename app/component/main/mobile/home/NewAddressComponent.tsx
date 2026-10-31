/**
 * NewAddressComponent
 *
 * Full-screen form component for adding a new delivery address with Google Places autocomplete integration.
 *
 * Features:
 * - Google Places Autocomplete: Single input field that searches as user types
 * - Auto-population: Selecting a prediction automatically fills all address fields
 * - Manual editing: All fields remain editable after auto-population
 * - Coordinate capture: Automatically captures latitude/longitude from Google Places
 * - Validation: Ensures all required fields are filled before submission
 * - API integration: Saves address to backend and refreshes address list
 *
 * Flow:
 * 1. User types in "Address Line 1" field (minimum 2 characters)
 * 2. Debounced search (300ms) triggers Google Places autocomplete API
 * 3. Predictions displayed in dropdown below input
 * 4. User selects a prediction
 * 5. Place details API fetches full address information
 * 6. Address components parsed and auto-populate form fields
 * 7. User can manually edit any field if needed
 * 8. User fills in delivery name and submits
 * 9. Address saved to backend with coordinates
 * 10. onPress callback executed with saved address
 *
 * Props:
 * @param {Function} onPress - Callback executed when address is successfully saved
 *                            Receives the saved DeliveryAddress object
 *
 * @returns {JSX.Element} Full-screen address entry form with autocomplete
 */
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { Button } from "react-native-paper";
import { useState, useEffect, useCallback } from "react";
import { DeliveryAddress } from "@/app/interfaces/main/home/HomeInterfaces";
import {
  getPlacePredictions,
  getPlaceDetails,
  parseAddressComponents,
  PlacePrediction,
  PlaceDetails,
} from "@/app/_utils/places";
import { useAddDeliveryAddressMutation } from "@/app/store/main/api/profileApi";
import { useGetAllAddressesQuery } from "@/app/store/main/api/profileApi";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

const NewAddressComponent = ({
  onPress,
}: {
  onPress: (savedAddress?: DeliveryAddress) => void;
}) => {
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [address, setAddress] = useState<Partial<DeliveryAddress>>({
    delivery_name: "",
    address: "",
    city: "",
    zip_code: "",
    country: "",
    latitude: undefined,
    longitude: undefined,
  });
  const [isLoadingPredictions, setIsLoadingPredictions] =
    useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const [addDeliveryAddress, { isLoading: isSaving }] =
    useAddDeliveryAddressMutation();
  const { refetch } = useGetAllAddressesQuery();

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const backgroundColor = useThemeColor({}, "background");

  /**
   * Debounced search effect for Google Places autocomplete
   *
   * Triggers place predictions API call after user stops typing for 300ms
   * - Minimum 2 characters required to trigger search
   * - Clears predictions if input is too short
   * - Handles loading state during API call
   * - Cleans up timeout on unmount or input change
   *
   * @effect
   * @dependencies {addressLine1}
   */
  useEffect(() => {
    if (!addressLine1 || addressLine1.length < 2) {
      setPredictions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingPredictions(true);
      try {
        const results = await getPlacePredictions(addressLine1);
        setPredictions(results);
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setPredictions([]);
      } finally {
        setIsLoadingPredictions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [addressLine1]);

  /**
   * Handles selection of a Google Places prediction
   *
   * Process:
   * 1. Hides predictions list immediately for better UX
   * 2. Updates addressLine1 input with full prediction description
   * 3. Fetches detailed place information using place_id
   * 4. Parses address components (street, city, zip, country, coordinates)
   * 5. Auto-populates all form fields with parsed data
   *
   * @param {PlacePrediction} prediction - The selected prediction from autocomplete
   * @returns {Promise<void>}
   */
  const handlePredictionSelect = useCallback(
    async (prediction: PlacePrediction) => {
      setIsLoadingDetails(true);
      setPredictions([]); // Hide predictions list
      setAddressLine1(prediction.description); // Set the full description

      try {
        const placeDetails = await getPlaceDetails(prediction.place_id);
        if (placeDetails) {
          setSelectedPlace(placeDetails);
          const parsedAddress = parseAddressComponents(placeDetails);
          setAddress((prev) => ({
            ...prev,
            address: parsedAddress.address,
            city: parsedAddress.city,
            zip_code: parsedAddress.zip_code,
            country: parsedAddress.country,
            latitude: parsedAddress.latitude,
            longitude: parsedAddress.longitude,
          }));
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
        Alert.alert(
          "Error",
          "Failed to load address details. Please try again."
        );
      } finally {
        setIsLoadingDetails(false);
      }
    },
    []
  );

  /**
   * Updates a specific field in the address state
   *
   * @param {keyof DeliveryAddress} field - The field name to update
   * @param {string} value - The new value for the field
   * @returns {void}
   */
  const handleChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handles form submission and address saving
   *
   * Process:
   * 1. Validates all required fields are filled
   * 2. Calls API mutation to save address to backend
   * 3. Refetches address list to show newly saved address
   * 4. Executes onPress callback with saved address
   * 5. Displays error alerts if validation or save fails
   *
   * Required fields: delivery_name, address, city, zip_code, country
   * Optional fields: latitude, longitude (auto-captured from Google Places)
   *
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (
      !address.delivery_name ||
      !address.address ||
      !address.city ||
      !address.zip_code ||
      !address.country
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      const result = await addDeliveryAddress(
        address as DeliveryAddress
      ).unwrap();
      const savedAddress = result.delivery_address;

      // Refetch addresses list
      await refetch();

      // Call onPress with the saved address
      onPress(savedAddress);
    } catch (error: any) {
      console.error("Failed to save address:", error);
      Alert.alert(
        "Error",
        error?.data?.error || "Failed to save address. Please try again."
      );
    }
  };

  const renderPrediction = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity
      style={[styles.predictionItem, { borderColor, backgroundColor }]}
      onPress={() => handlePredictionSelect(item)}
    >
      <StyledText variant="bodyMedium" style={{ color: textColor }}>
        {item.structured_formatting.main_text}
      </StyledText>
      <StyledText
        variant="bodySmall"
        style={{ color: textColor, opacity: 0.7 }}
      >
        {item.structured_formatting.secondary_text}
      </StyledText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <StyledTextInput
          placeholder="Enter your full name"
          label="Full Name"
          value={address.delivery_name || ""}
          onChangeText={(value) => handleChange("delivery_name", value)}
          importantForAutofill="yes"
          autoComplete="name"
        />

        <View style={styles.addressSearchContainer}>
          <StyledTextInput
            placeholder="Start typing your address..."
            label="Address Line 1"
            value={addressLine1}
            onChangeText={setAddressLine1}
            importantForAutofill="yes"
            autoComplete="address-line1"
          />
          {isLoadingPredictions && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          )}
          {predictions.length > 0 && !isLoadingDetails && (
            <View
              style={[
                styles.predictionsContainer,
                { borderColor, backgroundColor },
              ]}
            >
              <FlatList
                data={predictions}
                renderItem={renderPrediction}
                keyExtractor={(item) => item.place_id}
                scrollEnabled={false}
                nestedScrollEnabled={true}
              />
            </View>
          )}
        </View>

        {isLoadingDetails && (
          <View style={styles.loadingDetailsContainer}>
            <ActivityIndicator size="small" />
            <StyledText style={{ color: textColor, marginTop: 5 }}>
              Loading address details...
            </StyledText>
          </View>
        )}

        <StyledTextInput
          placeholder="Address"
          label="Address"
          value={address.address || ""}
          onChangeText={(value) => handleChange("address", value)}
          style={styles.input}
          importantForAutofill="yes"
          autoComplete="address-line1"
        />

        <StyledTextInput
          placeholder="City"
          label="City"
          value={address.city || ""}
          onChangeText={(value) => handleChange("city", value)}
          style={styles.input}
          importantForAutofill="yes"
        />

        <StyledTextInput
          placeholder="Postal Code/Zip Code"
          label="Postal Code/Zip Code"
          value={address.zip_code || ""}
          onChangeText={(value) => handleChange("zip_code", value)}
          style={styles.input}
          importantForAutofill="yes"
          autoComplete="postal-code"
        />

        <StyledTextInput
          placeholder="Country"
          label="Country"
          value={address.country || ""}
          onChangeText={(value) => handleChange("country", value)}
          style={styles.input}
          importantForAutofill="yes"
          autoComplete="country"
        />
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSaving}
        disabled={isSaving}
      >
        Save Address
      </Button>
    </View>
  );
};

export default NewAddressComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    gap: 10,
    padding: 10,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "BarlowMedium",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Barlow",
  },
  addressInput: {
    height: 80,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 20,
    width: "50%",
    alignSelf: "center",
  },
  addressSearchContainer: {
    position: "relative",
    zIndex: 10,
  },
  loadingContainer: {
    position: "absolute",
    right: 15,
    top: 45,
    zIndex: 1,
  },
  predictionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  loadingDetailsContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
});
