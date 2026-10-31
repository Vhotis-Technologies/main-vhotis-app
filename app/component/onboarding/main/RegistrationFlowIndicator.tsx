import { StyleSheet, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import StepIndicatorProps, {
  Step,
} from "@/app/interfaces/others/OnboardingInterfaces";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";

export const defaultRegSteps: Step[] = [
  { title: "About you", key: 1 },
  { title: "Address", key: 2 },
  { title: "Security", key: 3 },
];

const RegistrationFlowIndicator = ({
  currentStep,
  steps,
}: StepIndicatorProps) => {
  const animatedValues = useRef(steps.map(() => new Animated.Value(0))).current;

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");

  useEffect(() => {
    steps.forEach((_, index) => {
      const shouldAnimate = currentStep > index + 1;
      Animated.timing(animatedValues[index], {
        toValue: shouldAnimate ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStep]);

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step: Step, index: number) => (
          <React.Fragment key={step.key}>
            <View style={styles.stepItem}>
              <View style={styles.stepContent}>
                <View
                  style={[
                    styles.stepCircle,
                    { backgroundColor: borderColor, borderColor },
                    currentStep >= step.key && {
                      backgroundColor: buttonColor,
                      borderColor: buttonColor,
                      shadowColor: buttonColor,
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    },
                    currentStep > step.key && {
                      backgroundColor: "#4CAF50",
                      borderColor: "#4CAF50",
                    },
                  ]}
                >
                  {currentStep > step.key ? (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <StyledText
                      variant="bodyMedium"
                      style={[
                        styles.stepNumber,
                        { color: textColor, opacity: 0.6 },
                        currentStep >= step.key && { color: buttonTextColor },
                      ]}
                    >
                      {step.key}
                    </StyledText>
                  )}
                </View>
                <StyledText
                  variant="bodySmall"
                  style={[
                    styles.stepTitle,
                    { color: textColor, opacity: 0.6 },
                    currentStep >= step.key && {
                      color: buttonColor,
                      fontWeight: "600",
                    },
                    currentStep > step.key && {
                      color: "#4CAF50",
                      fontWeight: "600",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </StyledText>
              </View>
            </View>

            {index < steps.length - 1 && (
              <View style={styles.stepLineContainer}>
                <View
                  style={[styles.stepLine, { backgroundColor: borderColor }]}
                />
                <Animated.View
                  style={[
                    styles.stepLineActive,
                    {
                      backgroundColor: buttonColor,
                      width: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
    maxWidth: 80,
  },
  stepContent: {
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepTitle: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 14,
  },
  stepLineContainer: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: -18,
    position: "relative",
  },
  stepLine: {
    height: 2,
    borderRadius: 1,
  },
  stepLineActive: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
});

export default RegistrationFlowIndicator;
