/**
 * FAQ (Frequently Asked Questions) component that displays collapsible question/answer sections.
 * Provides an expandable/collapsible interface for displaying common questions and their answers.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

/**
 * FAQComponent displays a list of frequently asked questions in an accordion-style layout.
 * Each question can be expanded/collapsed to show/hide its answer.
 *
 * @returns {JSX.Element} The rendered FAQ component
 */
const FAQComponent = () => {
  // Track which FAQ item is currently open
  const [isOpen, setIsOpen] = useState<string>("");

  // Get theme colors
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");

  /**
   * Handles the toggling of FAQ items
   * @param {string} value - The identifier of the FAQ item to toggle
   */
  const handleOpen = (value: string) => {
    setIsOpen(isOpen === value ? "" : value);
  };

  return (
    <View style={styles.maincontainer}>
      {/* FAQ Header */}
      <View
        style={[styles.headerContainer, { borderBottomColor: borderColor }]}
      >
        <StyledText
          variant="titleMedium"
          style={{ color: textColor, fontWeight: "600" }}
        >
          Questions you might have
        </StyledText>
      </View>

      {/* FAQ Items */}
      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        {/* Personal Information FAQ Item */}
        <Pressable style={styles.button} onPress={() => handleOpen("personal")}>
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, flex: 1 }}
          >
            Why do i need to provide my information?
          </StyledText>
          <FontAwesome
            name={isOpen === "personal" ? "chevron-up" : "chevron-down"}
            size={16}
            color={buttonColor}
          />
        </Pressable>
        {/* Answer section - only visible when this FAQ item is open */}
        {isOpen === "personal" && (
          <View style={styles.answerContainer}>
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, opacity: 0.8 }}
            >
              Regulations require that we collect certain business and personal
              informations from our sellers, and to take steps to verify the
              information provided.
            </StyledText>
          </View>
        )}
      </View>

      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <Pressable style={styles.button} onPress={() => handleOpen("phone")}>
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, flex: 1 }}
          >
            What is the correct format of the phone number?
          </StyledText>
          <FontAwesome
            name={isOpen === "phone" ? "chevron-up" : "chevron-down"}
            size={16}
            color={buttonColor}
          />
        </Pressable>
        {isOpen === "phone" && (
          <View style={styles.answerContainer}>
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, opacity: 0.8 }}
            >
              The phone number must be prefixed with the country code of
              residence. Following is an example of a valid format.
              +12933300000, +447933300000
            </StyledText>
          </View>
        )}
      </View>

      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <Pressable
          style={styles.button}
          onPress={() => handleOpen("no-number")}
        >
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, flex: 1 }}
          >
            What if i don't have a number?
          </StyledText>
          <FontAwesome
            name={isOpen === "no-number" ? "chevron-up" : "chevron-down"}
            size={16}
            color={buttonColor}
          />
        </Pressable>
        {isOpen === "no-number" && (
          <View style={styles.answerContainer}>
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, opacity: 0.8 }}
            >
              You can give us your landline or home number. However, we need a
              mobile number we can verify which will be used for all
              communications,and order notifications.
            </StyledText>
          </View>
        )}
      </View>

      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <Pressable
          style={styles.button}
          onPress={() => handleOpen("pin-not-recieved")}
        >
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, flex: 1 }}
          >
            What if i don't receive the pin?
          </StyledText>
          <FontAwesome
            name={isOpen === "pin-not-recieved" ? "chevron-up" : "chevron-down"}
            size={16}
            color={buttonColor}
          />
        </Pressable>
        {isOpen === "pin-not-recieved" && (
          <View style={styles.answerContainer}>
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, opacity: 0.8 }}
            >
              Check again if you have entered the phone number in the correct
              format, and if you have entered the correct number. Try again
            </StyledText>
          </View>
        )}
      </View>

      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <Pressable style={styles.button} onPress={() => handleOpen("country")}>
          <StyledText
            variant="labelMedium"
            style={{ color: textColor, flex: 1 }}
          >
            What do i do if my country is not listed?
          </StyledText>
          <FontAwesome
            name={isOpen === "country" ? "chevron-up" : "chevron-down"}
            size={16}
            color={buttonColor}
          />
        </Pressable>
        {isOpen === "country" && (
          <View style={styles.answerContainer}>
            <StyledText
              variant="bodyMedium"
              style={{ color: textColor, opacity: 0.8 }}
            >
              If you country is not yet listed, please be patient as we are
              working on expanding our coverage. You could contact us at
              sellersupport@lumeo.com
            </StyledText>
          </View>
        )}
      </View>
    </View>
  );
};

export default FAQComponent;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    width: "100%",
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  answerContainer: {
    marginTop: 12,
    paddingLeft: 8,
  },
});
