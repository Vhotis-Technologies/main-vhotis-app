import StyledText from "@/app/component/helpers/forms/StyledText";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { updateRegistrationField } from "@/app/store/main/slices/onboardingSlice";
import { RegistrationFormData } from "@/app/interfaces/others/OnboardingInterfaces";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import OnboardingSectionCard from "@/app/component/onboarding/main/OnboardingSectionCard";

const REQUIREMENTS = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "letter",
    label: "Contains a letter",
    test: (p: string) => /[a-zA-Z]/.test(p),
  },
  {
    key: "number",
    label: "Contains a number",
    test: (p: string) => /\d/.test(p),
  },
  {
    key: "upper",
    label: "Contains an uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
];

const PasswordForm = () => {
  const dispatch = useDispatch();
  const registrationFormData = useSelector(
    (state: RootState) => state.onboarding.registrationFormData,
  );

  const [confirmPassword, setConfirmPassword] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const errorColor = useThemeColor({}, "error");
  const iconMuted = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");

  const password = registrationFormData?.password || "";

  const handleRegistrationFormData = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    dispatch(updateRegistrationField({ field, value }));
  };

  const getPasswordStrength = (value: string) => {
    if (!value) return { strength: 0, color: borderColor, text: "" };

    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;

    switch (score) {
      case 0:
      case 1:
        return { strength: score, color: errorColor, text: "Very weak" };
      case 2:
        return { strength: score, color: "#FF8800", text: "Weak" };
      case 3:
        return { strength: score, color: "#FFCC00", text: "Fair" };
      case 4:
        return { strength: score, color: "#4CAF50", text: "Strong" };
      default:
        return { strength: score, color: borderColor, text: "" };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMismatch =
    Boolean(confirmPassword) && confirmPassword !== password;

  return (
    <View style={styles.container}>
      <OnboardingSectionCard
        icon="lock-outline"
        title="Create a password"
        subtitle="Choose something unique you haven't used elsewhere"
      >
        <View style={styles.passwordWrap}>
          <StyledTextInput
            placeholder="Enter your password"
            label="Password"
            value={registrationFormData?.password}
            onChangeText={(text) =>
              handleRegistrationFormData("password", text)
            }
            secureTextEntry={!showPassword}
            importantForAutofill="yes"
            autoComplete="password-new"
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

        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBar}>
              {[1, 2, 3, 4].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthSegment,
                    {
                      backgroundColor:
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : borderColor,
                    },
                  ]}
                />
              ))}
            </View>
            {passwordStrength.text ? (
              <StyledText
                variant="bodySmall"
                style={{ color: passwordStrength.color, textAlign: "center" }}
              >
                {passwordStrength.text}
              </StyledText>
            ) : null}
          </View>
        )}

        <View style={styles.passwordWrap}>
          <StyledTextInput
            placeholder="Re-enter your password"
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            importantForAutofill="yes"
            autoComplete="password-new"
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

        {passwordsMismatch && (
          <StyledText variant="bodySmall" style={{ color: errorColor }}>
            Passwords do not match
          </StyledText>
        )}
      </OnboardingSectionCard>

      <OnboardingSectionCard
        icon="verified-user"
        title="Password requirements"
        subtitle="Your password must meet all of the following"
      >
        {REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <View key={req.key} style={styles.requirementRow}>
              <MaterialIcons
                name={met ? "check-circle" : "radio-button-unchecked"}
                size={18}
                color={met ? "#4CAF50" : iconMuted}
              />
              <StyledText
                variant="bodyMedium"
                style={{
                  color: met ? textColor : iconMuted,
                  flex: 1,
                }}
              >
                {req.label}
              </StyledText>
            </View>
          );
        })}

        <View
          style={[
            styles.tipBox,
            { backgroundColor: `${buttonColor}10`, borderColor: `${buttonColor}30` },
          ]}
        >
          <MaterialIcons name="tips-and-updates" size={16} color={buttonColor} />
          <StyledText
            variant="bodySmall"
            style={{ color: iconMuted, flex: 1, lineHeight: 18 }}
          >
            Use a mix of letters, numbers, and symbols for the strongest
            protection.
          </StyledText>
        </View>
      </OnboardingSectionCard>
    </View>
  );
};

export default PasswordForm;

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  strengthContainer: {
    marginTop: -4,
    gap: 4,
  },
  strengthBar: {
    flexDirection: "row",
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
});
