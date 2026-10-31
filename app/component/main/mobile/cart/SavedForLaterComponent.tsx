import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import useSavedForLater from "@/app/hook/main/useSavedForLater";
import { SavedForLaterItem } from "@/app/store/main/api/savedForLaterApi";
import { useAlertContext } from "@/app/contexts/AlertContext";

interface SavedForLaterComponentProps {
  onItemPress?: (productId: string) => void;
}

const SavedForLaterComponent: React.FC<SavedForLaterComponentProps> = ({
  onItemPress,
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");
  const buttonTextColor = useThemeColor({}, "buttonText");
  const borderColor = useThemeColor({}, "borders");

  const { setAlertConfig, setIsVisible } = useAlertContext();

  const {
    savedItems,
    isLoading,
    handleMoveToCart,
    handleRemoveSaved,
    moving,
    removing,
  } = useSavedForLater();

  const handleMoveToCartPress = async (item: SavedForLaterItem) => {
    setAlertConfig({
      isVisible: true,
      title: "Move to Cart",
      message: `Move ${item.name} back to your cart?`,
      type: "success",
      onConfirm: async () => {
        await handleMoveToCart(item.product_id, item.name);
        setIsVisible(false);
      },
      onClose: () => {
        setIsVisible(false);
      },
    });
  };

  const handleRemovePress = async (item: SavedForLaterItem) => {
    setAlertConfig({
      isVisible: true,
      title: "Remove Item",
      message: `Remove ${item.name} from saved items?`,
      type: "success",
      onConfirm: async () => {
        await handleRemoveSaved(item.product_id);
        setIsVisible(false);
      },
      onClose: () => {
        setIsVisible(false);
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Ionicons name="bookmark-outline" size={24} color={iconColor} />
          <StyledText
            variant="titleMedium"
            style={[styles.title, { color: textColor }]}
          >
            Saved for Later
          </StyledText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={iconColor} />
          <StyledText
            variant="labelSmall"
            style={[styles.loadingText, { color: iconColor }]}
          >
            Loading saved items...
          </StyledText>
        </View>
      </View>
    );
  }

  if (!savedItems || savedItems.length === 0) {
    return null; // Don't show anything if no saved items
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Ionicons name="bookmark-outline" size={24} color={iconColor} />
        <StyledText
          variant="titleMedium"
          style={[styles.title, { color: textColor }]}
        >
          Saved for Later ({savedItems.length})
        </StyledText>
      </View>

      {savedItems.map((item) => (
        <View key={item.id} style={[styles.itemContainer, { borderColor }]}>
          <TouchableOpacity
            style={styles.itemContent}
            onPress={() => onItemPress?.(item.product_id)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.image || undefined }}
              style={styles.itemImage}
              defaultSource={require("@/assets/images/icon.png")}
            />
            <View style={styles.itemDetails}>
              <StyledText
                variant="labelMedium"
                style={[styles.itemName, { color: textColor }]}
                numberOfLines={2}
              >
                {item.name}
              </StyledText>
              <StyledText
                variant="labelSmall"
                style={[styles.itemPrice, { color: iconColor }]}
              >
                {item.price} • Qty: {item.quantity}
              </StyledText>
              {item.store_name && (
                <StyledText
                  variant="labelSmall"
                  style={[styles.storeName, { color: iconColor }]}
                >
                  {item.store_name}
                </StyledText>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.moveButton,
                { backgroundColor: buttonColor },
              ]}
              onPress={() => handleMoveToCartPress(item)}
              disabled={moving}
            >
              {moving ? (
                <ActivityIndicator size="small" color={buttonTextColor} />
              ) : (
                <>
                  <Ionicons
                    name="cart-outline"
                    size={16}
                    color={buttonTextColor}
                  />
                  <StyledText
                    variant="labelSmall"
                    style={[styles.actionText, { color: buttonTextColor }]}
                  >
                    Move to Cart
                  </StyledText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemovePress(item)}
              disabled={removing}
            >
              {removing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SavedForLaterComponent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
  },
  itemContainer: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemContent: {
    flexDirection: "row",
    padding: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    backgroundColor: "#F5F5F5",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPrice: {
    marginBottom: 2,
  },
  storeName: {
    fontStyle: "italic",
  },
  itemActions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 36,
  },
  moveButton: {
    flex: 1,
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    minWidth: 36,
  },
  actionText: {
    marginLeft: 4,
    fontWeight: "500",
  },
});
