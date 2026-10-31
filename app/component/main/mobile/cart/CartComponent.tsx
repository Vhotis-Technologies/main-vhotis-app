import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CartItems } from "@/app/interfaces/main/cart/CartInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import {
  formatBogoCartSummary,
  getBogoQuantities,
  isBogoDealType,
} from "@/app/_utils/main/dealPricing";

const CartComponent = ({
  cartItems,
  onRemove,
  onSaveForLater,
  onIncrement,
  onDecrement,
  onProductPress,
  isAddingToCart,
  isRemovingFromCart,
  isDeletingCartItem,
  isAddingToWishlist,
}: {
  cartItems: CartItems;
  onRemove: (id: string) => void;
  onSaveForLater: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onProductPress: (id: string) => void;
  isAddingToCart: boolean;
  isRemovingFromCart: boolean;
  isDeletingCartItem: boolean;
  isAddingToWishlist: boolean;
}) => {
  const iconColor = useThemeColor({}, "text");

  const originalPrice =
    typeof cartItems.selling_price === "number"
      ? cartItems.selling_price
      : cartItems.price;

  const promo = cartItems.promotion_applied;
  const isBogo = isBogoDealType(promo?.deal_type);
  const { buy, get } = getBogoQuantities(
    promo
      ? {
          deal_type: promo.deal_type,
          bogo_buy_quantity: promo.bogo_buy_quantity,
          bogo_get_quantity: promo.bogo_get_quantity,
        }
      : null
  );

  const quantityPaid = cartItems.quantity_paid ?? cartItems.quantity;
  const quantityFree = cartItems.quantity_free ?? 0;

  const hasPercentageOrFixedDiscount =
    !isBogo &&
    typeof cartItems.discounted_price === "number" &&
    cartItems.discounted_price > 0 &&
    cartItems.discounted_price < originalPrice;

  const displayUnitPrice = isBogo
    ? originalPrice
    : hasPercentageOrFixedDiscount
      ? cartItems.discounted_price!
      : originalPrice;

  const bogoSummary = isBogo
    ? formatBogoCartSummary(
        cartItems.quantity,
        quantityPaid,
        quantityFree,
        buy,
        get
      )
    : null;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.imageContainer}
        onPress={() => onProductPress(cartItems.id)}
      >
        <Image
          source={
            typeof cartItems.image === "string"
              ? { uri: cartItems.image }
              : cartItems.image
          }
          style={styles.image}
        />
      </Pressable>

      <View style={styles.itemDescContainer}>
        <View style={styles.ItemsContainer}>
          <StyledText children={cartItems.product_name} variant="labelSmall" />
          <StyledText
            children={`Subtotal: ${formatCurrency(cartItems.sub_total)}`}
            variant="labelMedium"
          />
          <StyledText
            children={`Quantity: ${cartItems.quantity}`}
            variant="labelMedium"
          />
          {isBogo ? (
            <>
              <StyledText variant="labelMedium" style={styles.bogoLine}>
                {`Unit price: ${formatCurrency(originalPrice)}`}
              </StyledText>
              <StyledText variant="labelMedium" style={styles.bogoHighlight}>
                {bogoSummary}
              </StyledText>
            </>
          ) : (
            <>
              {hasPercentageOrFixedDiscount ? (
                <StyledText
                  children={`Was: ${formatCurrency(originalPrice)}`}
                  variant="labelMedium"
                  style={styles.originalPrice}
                />
              ) : null}
              <StyledText
                children={`Price: ${formatCurrency(displayUnitPrice)}`}
                variant="labelMedium"
              />
            </>
          )}
        </View>

        <View style={styles.itemEditContainer}>
          <View style={styles.incrementButtonContainer}>
            {isAddingToCart ? (
              <ActivityIndicator size="small" color={iconColor} />
            ) : (
              <TouchableOpacity
                style={styles.incrementButtons}
                onPress={() => onIncrement(cartItems.id)}
              >
                <StyledText
                  children="+"
                  variant="labelLarge"
                  style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}
                />
              </TouchableOpacity>
            )}
            {isRemovingFromCart ? (
              <ActivityIndicator size="small" color={iconColor} />
            ) : (
              <TouchableOpacity
                style={styles.incrementButtons}
                onPress={() => onDecrement(cartItems.id)}
              >
                <StyledText
                  children="-"
                  variant="labelLarge"
                  style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}
                />
              </TouchableOpacity>
            )}
          </View>

          {isDeletingCartItem ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <TouchableOpacity
              style={styles.delete}
              onPress={() => onRemove(cartItems.cart_item_id)}
            >
              <MaterialIcons name="delete" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {isAddingToWishlist ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <TouchableOpacity
            style={styles.saveLater}
            onPress={() => onSaveForLater(cartItems.id)}
          >
            <StyledText
              children="Save for later"
              variant="labelMedium"
              style={styles.saveforLaterText}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CartComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    flexDirection: "row",
    width: "100%",
    marginBottom: 5,
  },
  imageContainer: {
    width: 130,
    height: 130,
    borderRadius: 5,
    marginEnd: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemDescContainer: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
  },
  ItemsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 5,
  },
  itemEditContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  incrementButtonContainer: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  incrementButtons: {
    padding: 5,
    flex: 1,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#063970",
    marginRight: 5,
  },
  delete: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  saveLater: {
    textAlign: "center",
    backgroundColor: "#063970",
    padding: 10,
    borderRadius: 5,
  },
  saveforLaterText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "SansitaRegular",
    textTransform: "capitalize",
    alignSelf: "center",
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  bogoLine: {
    color: "#888",
  },
  bogoHighlight: {
    color: "#0E7490",
    fontWeight: "600",
  },
});
