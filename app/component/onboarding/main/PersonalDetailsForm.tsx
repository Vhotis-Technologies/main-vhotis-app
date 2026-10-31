import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import CountryDialCodePicker from "@/app/component/helpers/forms/CountryDialCodePicker";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import EthnicitySelector from "../../helpers/others/EthnicitySelector";
import GenderSelector from "../../helpers/others/GenderSelector";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { updateRegistrationField } from "@/app/store/main/slices/onboardingSlice";
import * as Localization from "expo-localization";
import { getDialCodeForRegion } from "@/app/_utils/countryCallingCodes";
import { validateDateOfBirth } from "@/app/_utils/validateDateOfBirth";

const PersonalDetailsForm = () => {
  const dispatch = useAppDispatch();
  const registrationFormData = useAppSelector(
    (state) => state.onboarding.registrationFormData,
  );
  const [isEthnicitySelectorVisible, setIsEthnicitySelectorVisible] =
    React.useState(false);
  const [isGenderSelectorVisible, setIsGenderSelectorVisible] =
    React.useState(false);
  const [isDialPickerVisible, setIsDialPickerVisible] = React.useState(false);
  const dialDefaultedRef = React.useRef(false);
  const [day, setDay] = React.useState(
    registrationFormData?.dob?.split("-")[2] || "",
  );
  const [month, setMonth] = React.useState(
    registrationFormData?.dob?.split("-")[1] || "",
  );
  const [year, setYear] = React.useState(
    registrationFormData?.dob?.split("-")[0] || "",
  );

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const errorColor = useThemeColor({}, "error");
  const iconMuted = useThemeColor({}, "icons");

  React.useEffect(() => {
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

  const manageDob = (field: string, value: string) => {
    const cleaned = sanitizeDatePart(field, value);
    let newDay = day;
    let newMonth = month;
    let newYear = year;

    if (field === "day") {
      setDay(cleaned);
      newDay = cleaned;
    } else if (field === "month") {
      setMonth(cleaned);
      newMonth = cleaned;
    } else if (field === "year") {
      setYear(cleaned);
      newYear = cleaned;
    }

    const dob = `${newYear}-${newMonth}-${newDay}`;
    dispatch(updateRegistrationField({ field: "dob", value: dob }));
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

  const renderPicker = (
    label: string,
    value: string,
    placeholder: string,
    isOpen: boolean,
    onToggle: () => void,
    children: React.ReactNode,
  ) => (
    <View>
      <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
        {label}
      </StyledText>
      <Pressable
        style={[styles.picker, { borderColor }]}
        onPress={onToggle}
      >
        <StyledText
          variant="bodyMedium"
          style={{ color: value ? textColor : iconMuted, flex: 1 }}
        >
          {value || placeholder}
        </StyledText>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={22}
          color={iconMuted}
        />
      </Pressable>
      {isOpen && children}
    </View>
  );

  return (
    <View style={styles.container}>
      <OnboardingSectionCard
        icon="person-outline"
        title="Full name"
        subtitle="As it appears on your ID"
      >
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              placeholder="First name"
              label="First name"
              value={registrationFormData?.firstName}
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "firstName", value: text }),
                )
              }
              importantForAutofill="yes"
              autoComplete="given-name"
            />
          </View>
          <View style={styles.fieldHalf}>
            <StyledTextInput
              placeholder="Last name"
              label="Last name"
              value={registrationFormData?.lastName}
              onChangeText={(text) =>
                dispatch(
                  updateRegistrationField({ field: "lastName", value: text }),
                )
              }
              importantForAutofill="yes"
              autoComplete="family-name"
            />
          </View>
        </View>
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="contact-mail"
        title="Contact details"
        subtitle="We'll use this to verify your account"
      >
        <StyledTextInput
          placeholder="you@example.com"
          label="Email"
          value={registrationFormData?.email}
          onChangeText={(text) =>
            dispatch(updateRegistrationField({ field: "email", value: text }))
          }
          inputMode="email"
          importantForAutofill="yes"
          autoComplete="email"
          keyboardType="email-address"
        />

        <View>
          <StyledText variant="labelMedium" style={{ color: textColor, marginBottom: 6 }}>
            Phone number
          </StyledText>
          <View style={styles.phoneRow}>
            <Pressable
              onPress={() => setIsDialPickerVisible(true)}
              style={[styles.dialCodeButton, { borderColor }]}
            >
              <StyledText
                variant="bodyMedium"
                style={{ color: textColor, fontWeight: "600" }}
              >
                {registrationFormData?.phoneCountryCode || "—"}
              </StyledText>
              <MaterialIcons name="arrow-drop-down" size={22} color={textColor} />
            </Pressable>
            <View style={styles.phoneInputWrap}>
              <StyledTextInput
                placeholder="National number"
                value={registrationFormData?.phone}
                onChangeText={(text) =>
                  dispatch(updateRegistrationField({ field: "phone", value: text }))
                }
                importantForAutofill="yes"
                autoComplete="tel-national"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <StyledText variant="bodySmall" style={{ color: iconMuted, marginTop: 4 }}>
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
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="event"
        title="Date of birth"
        subtitle="Used to provide age-appropriate content"
      >
        <View style={styles.dobRow}>
          <View style={styles.dobField}>
            <StyledTextInput
              placeholder="DD"
              label="Day"
              value={day}
              onChangeText={(text) => manageDob("day", text)}
              importantForAutofill="yes"
              autoComplete="birthdate-day"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <View style={styles.dobField}>
            <StyledTextInput
              placeholder="MM"
              label="Month"
              value={month}
              onChangeText={(text) => manageDob("month", text)}
              importantForAutofill="yes"
              autoComplete="birthdate-month"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <View style={styles.dobFieldYear}>
            <StyledTextInput
              placeholder="YYYY"
              label="Year"
              value={year}
              onChangeText={(text) => manageDob("year", text)}
              importantForAutofill="yes"
              autoComplete="birthdate-year"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
        {showDobError ? (
          <StyledText variant="bodySmall" style={{ color: errorColor }}>
            {dobValidation.message}
          </StyledText>
        ) : null}
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="people"
        title="Personalization"
        subtitle="Optional — helps us tailor your experience"
      >
        {renderPicker(
          "Gender",
          registrationFormData?.gender ?? "",
          "Select your gender",
          isGenderSelectorVisible,
          () => setIsGenderSelectorVisible(!isGenderSelectorVisible),
          <ScrollView
            style={[styles.dropdown, { borderColor }]}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <GenderSelector
              selectedGender={registrationFormData?.gender}
              onSelect={(gender) => {
                dispatch(updateRegistrationField({ field: "gender", value: gender }));
                setIsGenderSelectorVisible(false);
              }}
            />
          </ScrollView>,
        )}

        {renderPicker(
          "Ethnicity",
          registrationFormData?.ethnicity ?? "",
          "Select your ethnicity",
          isEthnicitySelectorVisible,
          () => setIsEthnicitySelectorVisible(!isEthnicitySelectorVisible),
          <ScrollView
            style={[styles.dropdown, { borderColor }]}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <EthnicitySelector
              selectedEthnicity={registrationFormData?.ethnicity}
              onSelect={(ethnicity) => {
                dispatch(
                  updateRegistrationField({ field: "ethnicity", value: ethnicity }),
                );
                setIsEthnicitySelectorVisible(false);
              }}
            />
          </ScrollView>,
        )}
      </OnboardingSectionCard>
    </View>
  );
};

export default PersonalDetailsForm;

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
  picker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdown: {
    maxHeight: 140,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
  },
});
