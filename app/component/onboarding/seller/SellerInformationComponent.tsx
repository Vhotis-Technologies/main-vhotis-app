import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import countries from "world-countries";
import * as Localization from "expo-localization";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import AddressAutocompleteInput from "@/app/component/helpers/forms/AddressAutocompleteInput";
import CountryDialCodePicker from "@/app/component/helpers/forms/CountryDialCodePicker";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { updateRegistrationField } from "@/app/store/main/slices/onboardingSlice";
import { useThemeColor } from "@/hooks/useThemeColor";
import { getDialCodeForRegion } from "@/app/_utils/countryCallingCodes";
import { validateDateOfBirth } from "@/app/_utils/validateDateOfBirth";

interface SellerInformationProps {
  confirmPassword?: string;
  setConfirmPassword?: (password: string) => void;
}

const countryList = Object.entries(countries).map(([code, country]) => ({
  code,
  name: country.name.common as string,
}));

const SectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: cardColor, borderColor },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[styles.sectionIconWrap, { backgroundColor: `${buttonColor}15` }]}
        >
          <MaterialIcons name={icon} size={18} color={buttonColor} />
        </View>
        <View style={styles.sectionHeaderText}>
          <StyledText variant="labelLarge" style={{ color: textColor }}>
            {title}
          </StyledText>
          {subtitle ? (
            <StyledText
              variant="bodySmall"
              style={{ color: iconMuted, marginTop: 2 }}
            >
              {subtitle}
            </StyledText>
          ) : null}
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
};

const SellerInformation = ({
  confirmPassword,
  setConfirmPassword,
}: SellerInformationProps) => {
  const dispatch = useDispatch();
  const { registrationFormData } = useSelector(
    (state: RootState) => state.onboarding,
  );

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const errorColor = useThemeColor({}, "error");
  const iconMuted = useThemeColor({}, "icons");

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    registrationFormData?.country ?? "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDialPickerVisible, setIsDialPickerVisible] = useState(false);
  const dialDefaultedRef = useRef(false);

  const [day, setDay] = useState(
    registrationFormData?.dob?.split("-")[2] || "",
  );
  const [month, setMonth] = useState(
    registrationFormData?.dob?.split("-")[1] || "",
  );
  const [year, setYear] = useState(
    registrationFormData?.dob?.split("-")[0] || "",
  );

  useEffect(() => {
    if (!registrationFormData || dialDefaultedRef.current) return;
    dialDefaultedRef.current = true;
    if (!registrationFormData.phoneCountryCode) {
      const region = Localization.getLocales()[0]?.regionCode ?? undefined;
      dispatch(
        updateRegistrationField({
          field: "phoneCountryCode",
          value: getDialCodeForRegion(region),
        }),
      );
    }
  }, [registrationFormData, dispatch]);

  const sanitizeDatePart = (field: string, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (field === "day" || field === "month") return digits.slice(0, 2);
    if (field === "year") return digits.slice(0, 4);
    return digits;
  };

  const handleDobComponent = (
    type: "day" | "month" | "year",
    value: string,
  ) => {
    const cleaned = sanitizeDatePart(type, value);

    if (type === "day") setDay(cleaned);
    else if (type === "month") setMonth(cleaned);
    else setYear(cleaned);

    const currentDay = type === "day" ? cleaned : day;
    const currentMonth = type === "month" ? cleaned : month;
    const currentYear = type === "year" ? cleaned : year;

    if (currentDay || currentMonth || currentYear) {
      const formattedDob = `${currentYear.padStart(4, "0")}-${currentMonth.padStart(2, "0")}-${currentDay.padStart(2, "0")}`;
      dispatch(updateRegistrationField({ field: "dob", value: formattedDob }));
    }
  };

  const dobCombined = `${year}-${month}-${day}`;
  const dobValidation =
    year.length === 4 && month.length > 0 && day.length > 0
      ? validateDateOfBirth(dobCombined)
      : { ok: true as const, message: "" };
  const showDobError =
    Boolean(day || month || year) &&
    year.length === 4 &&
    month.length > 0 &&
    day.length > 0 &&
    !dobValidation.ok;

  const countryDisplay =
    selectedCountry || registrationFormData?.country || countryList[0].name;

  const passwordsMismatch =
    confirmPassword !== registrationFormData?.password &&
    Boolean(confirmPassword);

  return (
    <View style={styles.container}>
      {/* Identity */}
      <SectionCard
        icon="person-outline"
        title="Identity"
        subtitle="Use the name on your government-issued ID"
      >
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="First name"
              placeholder="First name"
              value={registrationFormData?.firstName}
              importantForAutofill="yes"
              autoComplete="given-name"
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "firstName", value: text || "" }),
                )
              }
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Last name"
              placeholder="Last name"
              value={registrationFormData?.lastName}
              importantForAutofill="yes"
              autoComplete="family-name"
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "lastName", value: text || "" }),
                )
              }
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
            Country of citizenship
          </StyledText>
          <Pressable
            style={[styles.picker, { borderColor }]}
            onPress={() => setIsCountryOpen(!isCountryOpen)}
          >
            <StyledText variant="bodyMedium" style={{ color: textColor, flex: 1 }}>
              {countryDisplay}
            </StyledText>
            <MaterialIcons
              name={isCountryOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={22}
              color={iconMuted}
            />
          </Pressable>
          {isCountryOpen && (
            <ScrollView
              style={[styles.pickerDropdown, { borderColor }]}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {countryList.map((country) => (
                <Pressable
                  key={country.code}
                  style={[
                    styles.pickerItem,
                    countryDisplay === country.name && {
                      backgroundColor: `${buttonColor}15`,
                    },
                  ]}
                  onPress={() => {
                    setIsCountryOpen(false);
                    setSelectedCountry(country.name);
                    dispatch(
                      updateRegistrationField({
                        field: "country",
                        value: country.name,
                      }),
                    );
                  }}
                >
                  <StyledText variant="bodyMedium">{country.name}</StyledText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
            Date of birth
          </StyledText>
          <View style={styles.dobRow}>
            <View style={styles.dobField}>
              <StyledTextInput
                placeholder="DD"
                label="Day"
                keyboardType="numeric"
                maxLength={2}
                value={day}
                importantForAutofill="yes"
                autoComplete="birthdate-day"
                onChangeText={(text) => handleDobComponent("day", text)}
              />
            </View>
            <View style={styles.dobField}>
              <StyledTextInput
                placeholder="MM"
                label="Month"
                keyboardType="numeric"
                maxLength={2}
                value={month}
                importantForAutofill="yes"
                autoComplete="birthdate-month"
                onChangeText={(text) => handleDobComponent("month", text)}
              />
            </View>
            <View style={styles.dobFieldYear}>
              <StyledTextInput
                placeholder="YYYY"
                label="Year"
                keyboardType="numeric"
                maxLength={4}
                value={year}
                importantForAutofill="yes"
                autoComplete="birthdate-year"
                onChangeText={(text) => handleDobComponent("year", text)}
              />
            </View>
          </View>
          {showDobError ? (
            <StyledText variant="bodySmall" style={{ color: errorColor, marginTop: 6 }}>
              {dobValidation.message}
            </StyledText>
          ) : null}
        </View>
      </SectionCard>

      {/* Address */}
      <SectionCard
        icon="location-on"
        title="Residential address"
        subtitle="Choose a suggestion to auto-fill city and postcode"
      >
        <AddressAutocompleteInput
          label="Address line 1"
          placeholder="Start typing your address"
          value={registrationFormData?.address1 ?? ""}
          onChangeText={(text) =>
            dispatch(
              updateRegistrationField({ field: "address1", value: text || "" }),
            )
          }
          onAddressResolved={(p) => {
            dispatch(updateRegistrationField({ field: "address1", value: p.addressLine1 }));
            dispatch(updateRegistrationField({ field: "postcode", value: p.postcode }));
            dispatch(updateRegistrationField({ field: "city", value: p.city }));
            dispatch(updateRegistrationField({ field: "country", value: p.country }));
            if (p.country) setSelectedCountry(p.country);
            const latStr =
              p.latitude != null && Number.isFinite(p.latitude)
                ? String(p.latitude)
                : "";
            const lngStr =
              p.longitude != null && Number.isFinite(p.longitude)
                ? String(p.longitude)
                : "";
            dispatch(updateRegistrationField({ field: "latitude", value: latStr }));
            dispatch(updateRegistrationField({ field: "longitude", value: lngStr }));
          }}
        />

        <View style={[styles.fieldRow, { marginTop: 12 }]}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="Post code / Eircode"
              placeholder="Post code"
              value={registrationFormData?.postcode}
              importantForAutofill="yes"
              autoComplete="postal-code"
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "postcode", value: text || "" }),
                )
              }
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              label="City"
              placeholder="City"
              value={registrationFormData?.city}
              importantForAutofill="yes"
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "city", value: text || "" }),
                )
              }
            />
          </View>
        </View>
      </SectionCard>

      {/* Contact */}
      <SectionCard
        icon="contact-mail"
        title="Contact details"
        subtitle="We'll use this to verify your account"
      >
        <View style={styles.fieldGroup}>
          <StyledTextInput
            label="Email address"
            placeholder="you@example.com"
            value={registrationFormData?.email}
            keyboardType="email-address"
            importantForAutofill="yes"
            autoComplete="email"
            onChangeText={(text) =>
              dispatch(
                updateRegistrationField({ field: "email", value: text || "" }),
              )
            }
          />
        </View>

        <View style={styles.fieldGroup}>
          <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
            Phone number
          </StyledText>
          <View style={styles.phoneRow}>
            <Pressable
              onPress={() => setIsDialPickerVisible(true)}
              style={[styles.dialCodeButton, { borderColor }]}
            >
              <StyledText variant="bodyMedium" style={{ color: textColor, fontWeight: "600" }}>
                {registrationFormData?.phoneCountryCode || "—"}
              </StyledText>
              <MaterialIcons name="arrow-drop-down" size={22} color={textColor} />
            </Pressable>
            <View style={styles.phoneInputWrap}>
              <StyledTextInput
                placeholder="National number"
                value={registrationFormData?.phone}
                keyboardType="phone-pad"
                importantForAutofill="yes"
                autoComplete="tel-national"
                onChangeText={(text) =>
                  dispatch(
                    updateRegistrationField({ field: "phone", value: text || "" }),
                  )
                }
              />
            </View>
          </View>
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, marginTop: 4 }}
          >
            Enter your number without the leading 0.
          </StyledText>
        </View>

        <CountryDialCodePicker
          visible={isDialPickerVisible}
          selectedDialCode={registrationFormData?.phoneCountryCode ?? ""}
          onSelect={(code) => {
            dispatch(
              updateRegistrationField({ field: "phoneCountryCode", value: code }),
            );
            setIsDialPickerVisible(false);
          }}
          onClose={() => setIsDialPickerVisible(false)}
        />
      </SectionCard>

      {/* Security */}
      <SectionCard
        icon="lock-outline"
        title="Account security"
        subtitle="Create a strong password for your seller account"
      >
        <View style={styles.fieldGroup}>
          <View style={styles.passwordWrap}>
            <StyledTextInput
              label="Password"
              placeholder="Create a password"
              value={registrationFormData?.password}
              importantForAutofill="yes"
              autoComplete="password-new"
              secureTextEntry={!showPassword}
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "password", value: text || "" }),
                )
              }
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={iconMuted}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.passwordWrap}>
            <StyledTextInput
              label="Confirm password"
              placeholder="Re-enter password"
              value={confirmPassword}
              importantForAutofill="yes"
              autoComplete="password-new"
              secureTextEntry={!showConfirmPassword}
              onChangeText={(text) => setConfirmPassword?.(text)}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                size={20}
                color={iconMuted}
              />
            </Pressable>
          </View>
        </View>

        {passwordsMismatch && (
          <StyledText variant="bodySmall" style={{ color: errorColor, marginTop: 4 }}>
            Passwords do not match
          </StyledText>
        )}
      </SectionCard>
    </View>
  );
};

export default SellerInformation;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 8,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldGroup: {
    gap: 0,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerDropdown: {
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  dobRow: {
    flexDirection: "row",
    gap: 8,
  },
  dobField: {
    flex: 1,
  },
  dobFieldYear: {
    flex: 1.4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  dialCodeButton: {
    minWidth: 88,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  phoneInputWrap: {
    flex: 1,
  },
  passwordWrap: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: 28,
    minWidth: 35,
    minHeight: 35,
    alignItems: "center",
    justifyContent: "center",
  },
});
