import { StyleSheet,Pressable , View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

const CartHeaderComponent = ({
  quantity,
  onDeleteCart,
}: {
  quantity: number;
  onDeleteCart: () => void;
}) => {
  const borderColor = useThemeColor({}, "borders");
  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}>
      <Pressable onPress={onDeleteCart} style={styles.clearCartButton}>
        <StyledText children="Clear Cart" variant="titleMedium" />
      </Pressable>

      <View style={styles.cartIconContainer}>
        {quantity > 0 && (
          <View style={styles.cartItemsTextContainer}>
            <StyledText children="Total Items" variant="titleMedium" />
            <StyledText children={`: ${quantity}`} variant="titleMedium" />
          </View>
        )}
      </View>
    </View>
  );
};

export default CartHeaderComponent;

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  cartIconContainer: {
    alignItems: "center",
  },
  cartItemsTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  clearCartButton:{
    padding: 5,
    borderRadius: 5,
  }
});
