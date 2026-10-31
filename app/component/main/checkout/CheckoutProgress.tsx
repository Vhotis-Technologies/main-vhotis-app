import { StyleSheet, Text, View } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CheckoutProgressProps {
  currentStep: number;
  steps: string[];
}

const CheckoutProgress = ({ currentStep, steps }: CheckoutProgressProps) => {
  const tintColor = useThemeColor({}, "tint");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");
  const borderColor = useThemeColor({}, "borders");

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                index < currentStep && {
                  backgroundColor: tintColor,
                  borderColor,
                },
                index === currentStep && {
                  backgroundColor: secondaryButtonColor,
                  borderColor,
                },
              ]}
            >
              {index < currentStep ? (
                <StyledText style={styles.completedStepText} children="✓" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index === currentStep && styles.activeStepText,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <StyledText
              style={[
                styles.stepText,
                index === currentStep && styles.activeStepLabel,
              ]}
            >
              {step}
            </StyledText>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connector,
                { backgroundColor: borderColor },
                index < currentStep && { backgroundColor: tintColor },
                index === currentStep - 1 && { backgroundColor: tintColor },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

export default CheckoutProgress;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    marginHorizontal: 15,
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  stepText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    maxWidth: 80,
  },
  activeStepText: {
    color: "#fff",
  },
  activeStepLabel: {
    color: "#000",
    fontWeight: "600",
  },
  completedStepText: {
    color: "#fff",
    fontSize: 14,
  },
  connector: {
    height: 2,
    flex: 1,
    marginHorizontal: 8,
    marginTop: -20,
  },
});
