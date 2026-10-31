import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ProductSideDetailsComponent from "./ProductSideDetailsComponent";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
const AddDecription = () => {
  const { handleProductUpdate, currentProduct } = useSellerInventory();
  
  return (
    <View style={styles.maincontainer}>
      <View style={styles.leftsection}>
        <ProductSideDetailsComponent
          title="Product description"
          body="Provide a quick description of your product for clarity."
        />
      </View>
      <View style={styles.rightsection}>
        <StyledTextInput
          label="Description"
          placeholder="Enter description"
          info="Description is a brief description of your product. It is used to help customers understand what your product is about. make this is as detailed as possible"
          multiline={true}
          numberOfLines={5}
          value={currentProduct?.description}
          onChangeText={(text) => handleProductUpdate({ field: "description", value: text })}
        />
      </View>
    </View>
  );
};

export default AddDecription;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  leftsection: {
    flex: 1,
    borderEndWidth: 1,
    borderColor: "white",
    shadowColor: "white",
    shadowOffset: { width: 0, height: 2 },
    boxShadow: "0px 0px 3px 3px rgba(251, 245, 245, 0.25)",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  rightsection: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 4,
    gap: 20,
    marginRight: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 15,
  },
});
