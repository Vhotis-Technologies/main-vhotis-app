import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import React from "react";
import { PaymentMethod } from "../../../interfaces/main/checkout/Checkout";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "../../helpers/forms/StyledText";

interface SavedCardsProps {
  savedCards: PaymentMethod[];
  selectedCardId?: string;
  onSelectCard: (card: PaymentMethod) => void;
}

const SavedCards = ({
  savedCards,
  selectedCardId,
  onSelectCard,
}: SavedCardsProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const tintColor = useThemeColor({}, "tint");

  if (!savedCards || savedCards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StyledText style={styles.title} children="Saved Cards" />
      <View style={[styles.cardList, { backgroundColor: cardColor, borderColor }]}>
        {savedCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              selectedCardId === card.id && { backgroundColor: tintColor },
              { borderColor },
            ]}
            onPress={() => onSelectCard(card)}
          >
            <View style={styles.cardTypeContainer}>
              <StyledText style={styles.cardType}>
                {card.type === "credit_card" ? "Credit Card" : "Debit Card"}
              </StyledText>
              <StyledText style={styles.cardNumber}>•••• {card.lastFourDigits}</StyledText>
            </View>
            <View style={styles.cardDetails}>
              <StyledText style={styles.cardHolder}>{card.cardHolderName}</StyledText>
              <StyledText style={styles.expiryDate}>Expires: {card.expiryDate}</StyledText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SavedCards;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  cardList: {
    gap: 10,
    ...Platform.select({
      web: {
        boxShadow: "2px 2px 3px 3px rgba(219, 150, 150, 0.1)",
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
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedCard: {
    borderColor: "red",
  },
  cardTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardNumber: {
    fontSize: 16,
    color: "#666",
  },
  cardDetails: {
    marginTop: 4,
  },
  cardHolder: {
    fontSize: 14,
    color: "#666",
  },
  expiryDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
