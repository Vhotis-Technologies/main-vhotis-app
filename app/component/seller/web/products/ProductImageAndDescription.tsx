import { ProductImageAndDescriptionInterface } from "@/app/interfaces/seller/ProductInterface";
import { limitDescription } from "@/app/_utils/main/helpers";
import { Image, StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";

const ProductImageAndDescription = ({
  id,
  image,
  description,
  name,
}: ProductImageAndDescriptionInterface) => {
  /* We want to limit the number of characters the description will contain to just 40.
and if the content is more than 40, we want to show the first 40 characters and then add ... */

  return (
    <View style={styles.maincontainer}>
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <StyledText style={styles.name}>{name}</StyledText>
        <StyledText style={styles.description}>
          {limitDescription(description ?? "")}
        </StyledText>
      </View>
    </View>
  );
};

export default ProductImageAndDescription;

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: "#666",
  },
});
