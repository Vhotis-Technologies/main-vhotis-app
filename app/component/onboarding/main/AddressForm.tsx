import StyledText from "@/app/component/helpers/forms/StyledText";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { batch } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { updateRegistrationField } from "@/app/store/main/slices/onboardingSlice";
import { RegistrationFormData } from "@/app/interfaces/others/OnboardingInterfaces";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import AddressAutocompleteInput from "@/app/component/helpers/forms/AddressAutocompleteInput";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";

const DELIVERY_BENEFITS = [
  { icon: "location-on" as const, text: "Accurate delivery tracking" },
  { icon: "schedule" as const, text: "Estimated delivery times" },
  { icon: "local-shipping" as const, text: "Shipping cost calculation" },
];

const AddressForm = () => {
  const dispatch = useDispatch();
  const registrationFormData = useSelector(
    (state: RootState) => state.onboarding.registrationFormData,
  );

  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  const handleRegistrationFormData = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    dispatch(updateRegistrationField({ field, value }));
  };

  return (
    <View style={styles.container}>
      <OnboardingSectionCard
        icon="home"
        title="Delivery address"
        subtitle="Type your address for suggestions"
      >
        <AddressAutocompleteInput
          placeholder="Street address"
          label="Address line 1"
          value={registrationFormData?.address1 ?? ""}
          onChangeText={(text) => handleRegistrationFormData("address1", text)}
          onAddressResolved={(p) => {
            batch(() => {
              dispatch(
                updateRegistrationField({
                  field: "address1",
                  value: p.addressLine1,
                }),
              );
              dispatch(
                updateRegistrationField({ field: "city", value: p.city }),
              );
              dispatch(
                updateRegistrationField({
                  field: "postcode",
                  value: p.postcode,
                }),
              );
              dispatch(
                updateRegistrationField({
                  field: "country",
                  value: p.country,
                }),
              );
              const latStr =
                p.latitude != null && Number.isFinite(p.latitude)
                  ? String(p.latitude)
                  : "";
              const lngStr =
                p.longitude != null && Number.isFinite(p.longitude)
                  ? String(p.longitude)
                  : "";
              dispatch(
                updateRegistrationField({ field: "latitude", value: latStr }),
              );
              dispatch(
                updateRegistrationField({ field: "longitude", value: lngStr }),
              );
            });
          }}
        />

        <StyledTextInput
          placeholder="Apartment, suite, unit, etc."
          label="Address line 2 (optional)"
          value={registrationFormData?.address2}
          onChangeText={(text) => handleRegistrationFormData("address2", text)}
          importantForAutofill="yes"
          autoComplete="address-line2"
          autoCapitalize="words"
        />

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              placeholder="City"
              label="City"
              value={registrationFormData?.city}
              onChangeText={(text) => handleRegistrationFormData("city", text)}
              importantForAutofill="yes"
              autoCapitalize="words"
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              placeholder="Post code"
              label="Postal code"
              value={registrationFormData?.postcode}
              onChangeText={(text) =>
                handleRegistrationFormData("postcode", text)
              }
              keyboardType="default"
              autoCapitalize="characters"
              importantForAutofill="yes"
              autoComplete="postal-code"
            />
          </View>
        </View>

        <StyledTextInput
          placeholder="Country"
          label="Country"
          value={registrationFormData?.country}
          onChangeText={(text) => handleRegistrationFormData("country", text)}
          importantForAutofill="yes"
          autoComplete="country"
          autoCapitalize="words"
        />
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="local-shipping"
        title="Why we need this"
        subtitle="Your address powers a better delivery experience"
      >
        {DELIVERY_BENEFITS.map((item) => (
          <View key={item.text} style={styles.benefitRow}>
            <View
              style={[styles.benefitIcon, { backgroundColor: `${buttonColor}15` }]}
            >
              <MaterialIcons name={item.icon} size={16} color={buttonColor} />
            </View>
            <StyledText variant="bodyMedium" style={{ color: textColor, flex: 1 }}>
              {item.text}
            </StyledText>
          </View>
        ))}
        <StyledText
          variant="bodySmall"
          style={{ color: iconMuted, lineHeight: 18, marginTop: 4 }}
        >
          We never share your address with third parties without your consent.
        </StyledText>
      </OnboardingSectionCard>
    </View>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
