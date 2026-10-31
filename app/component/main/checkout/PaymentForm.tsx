import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { PaymentMethod } from "../../../interfaces/main/checkout/Checkout";
import SavedCards from "./SavedCards";
import { Divider, Button } from "react-native-paper";
import StyledTextInput from "../../helpers/forms/StyledTextInput";
import StyledText from "../../helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PaymentFormProps {
  onSubmit: (payment: PaymentMethod) => void;
  savedCards?: PaymentMethod[];
  onGooglePayPress?: () => void;
  onApplePayPress?: () => void;
}

const PaymentForm = ({
  onSubmit,
  savedCards = [],
  onGooglePayPress,
  onApplePayPress,
}: PaymentFormProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>();
  const [isAddingNewCard, setIsAddingNewCard] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });

  const [paymentType, setPaymentType] =
    useState<PaymentMethod["type"]>("credit_card");

  const handleChange = (field: string, value: string) => {
    if (selectedCardId) {
      setSelectedCardId(undefined);
    }

    // Special handling for expiry date formatting
    if (field === "expiryDate") {
      // Remove any non-digit characters
      const cleaned = value.replace(/\D/g, "");

      // Format as MM/YY
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
      }

      // Limit to MM/YY format (5 characters total)
      formatted = formatted.slice(0, 5);

      setPaymentDetails((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    } else {
      setPaymentDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSelectCard = (card: PaymentMethod) => {
    setSelectedCardId(card.id);
    setPaymentType(card.type);
    setIsAddingNewCard(false);
    setPaymentDetails({
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cvv: "",
    });
  };

  /**
   * Clear the fields to allow the user enter the new card details securely
   * Trigger the dropdown when pressed to display the form
   */
  const handleAddNewCard = () => {
    setSelectedCardId(undefined);
    setIsAddingNewCard(!isAddingNewCard);
    setPaymentDetails({
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cvv: "",
    });
  };

  /**
   * Communicate with the server and store the users card details with the payment provider for future use, and security.
   *
   * @returns void
   */
  const handleSubmit = () => {
    if (selectedCardId) {
      const selectedCard = savedCards.find(
        (card) => card.id === selectedCardId
      );
      if (selectedCard) {
        onSubmit(selectedCard);
        return;
      }
    }
    // Get the payment details from the form
    const payment: PaymentMethod = {
      id: Date.now().toString(),
      type: paymentType,
      lastFourDigits: paymentDetails.cardNumber.slice(-4),
      cardHolderName: paymentDetails.cardHolderName,
      expiryDate: paymentDetails.expiryDate,
    };
    onSubmit(payment);
  };

  const showGooglePay = Platform.OS === "android" || Platform.OS === "web";
  const showApplePay = Platform.OS === "ios" || Platform.OS === "web";

  const isNewCardValid =
    paymentDetails.cardNumber.length >= 15 &&
    paymentDetails.cardHolderName.length > 0 &&
    paymentDetails.expiryDate.length === 5 &&
    paymentDetails.cvv.length >= 3;

  const canSubmit = selectedCardId || isNewCardValid;
  const isInputEnabled = isAddingNewCard && !selectedCardId;

  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "borders");
  const secondaryButtonColor = useThemeColor({}, "secondaryButton");

  return (
    <View style={[styles.container, { backgroundColor: cardColor }]}>
      <StyledText style={styles.title} children="Payment Information" />

      {(showGooglePay || showApplePay) && (
        <>
          <View style={styles.expressPayment}>
            {showGooglePay && (
              <Button
                mode="contained"
                onPress={onGooglePayPress}
                style={styles.paymentButtons}
                labelStyle={styles.expressButtonLabel}
              >
                Pay with Google Pay
              </Button>
            )}
            {showApplePay && (
              <Button
                mode="contained"
                onPress={onApplePayPress}
                style={styles.paymentButtons}
                labelStyle={styles.expressButtonLabel}
              >
                Pay with Apple Pay
              </Button>
            )}
          </View>
          <Divider style={styles.divider} />
        </>
      )}

      {/* Show the saved cards */}
      <SavedCards
        savedCards={savedCards}
        selectedCardId={selectedCardId}
        onSelectCard={handleSelectCard}
      />
      <Divider style={styles.divider} />
      <TouchableOpacity
        onPress={handleAddNewCard}
        style={styles.addNewCardButton}
      >
        <StyledText children="Add New Card" />
      </TouchableOpacity>

      {(isAddingNewCard || !savedCards.length) && (
        <>
          <View style={styles.paymentTypes}>
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentType === "credit_card" && {
                  backgroundColor: secondaryButtonColor,
                },
              ]}
              onPress={() => setPaymentType("credit_card")}
            >
              <StyledText
                style={[
                  styles.paymentTypeText,
                  paymentType === "credit_card" &&
                    styles.selectedPaymentTypeText,
                ]}
              >
                Credit Card
              </StyledText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentTypeButton,
                paymentType === "debit_card" && {
                  backgroundColor: secondaryButtonColor,
                },
              ]}
              onPress={() => setPaymentType("debit_card")}
            >
              <StyledText
                style={[
                  styles.paymentTypeText,
                  paymentType === "debit_card" &&
                    styles.selectedPaymentTypeText,
                ]}
              >
                Debit Card
              </StyledText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.inputContainer,
              !isInputEnabled && styles.disabledInput,
            ]}
          >
            <StyledTextInput
              label="Card Number"
              value={paymentDetails.cardNumber}
              onChangeText={(value) => handleChange("cardNumber", value)}
              placeholder="Card number"
              keyboardType="numeric"
              maxLength={16}
              editable={isInputEnabled}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              !isInputEnabled && styles.disabledInput,
            ]}
          >
            <StyledTextInput
              label="Cardholder Name"
              value={paymentDetails.cardHolderName}
              onChangeText={(value) => handleChange("cardHolderName", value)}
              placeholder="Name on card"
              editable={isInputEnabled}
              importantForAutofill="yes"
              autoComplete="cc-name"
            />
          </View>

          <View style={styles.row}>
            <View
              style={[
                styles.inputContainer,
                { flex: 1, marginRight: 8 },
                !isInputEnabled && styles.disabledInput,
              ]}
            >
              <StyledTextInput
                label="Expiry Date"
                value={paymentDetails.expiryDate}
                onChangeText={(value) => handleChange("expiryDate", value)}
                placeholder="MM/YY"
                maxLength={5}
                editable={isInputEnabled}
                importantForAutofill="yes"
                autoComplete="cc-exp"
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                { flex: 1, marginLeft: 8 },
                !isInputEnabled && styles.disabledInput,
              ]}
            >
              <StyledTextInput
                label="CVV"
                value={paymentDetails.cvv}
                onChangeText={(value) => handleChange("cvv", value)}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                editable={isInputEnabled}
                importantForAutofill="yes"
                autoComplete="cc-csc"
              />
            </View>
          </View>
        </>
      )}

      <Button
        style={[styles.button, !canSubmit && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        Save Payment Method
      </Button>
    </View>
  );
};

export default PaymentForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  expressPayment: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  paymentButtons: {
    flex: 1,
  },
  expressButtonLabel: {
    textAlign: "center",
  },
  divider: {
    marginVertical: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    color: "#333",
  },
  paymentTypes: {
    flexDirection: "row",
    marginBottom: 24,
  },
  paymentTypeButton: {
    flex: 1,
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "1px 1px 3px 3px rgba(49, 48, 48, 0.1)",
      },
      default: {
        shadowColor: "rgb(219, 150, 150)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
      },
    }),
  },
  paymentTypeText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedPaymentTypeText: {
    color: "#fff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  disabledInput: {
    opacity: 0.5,
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
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addNewCardButton: {
    alignSelf: "center",
    marginVertical: 5,
    marginBottom: 30,
  },
});
