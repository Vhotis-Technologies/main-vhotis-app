import StyledIconButton from "@/app/component/helpers/buttons/StyledIconButton";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const ProductNavComponent = () => {
  const buttonColor = useThemeColor({}, "button");
  const borderColor = useThemeColor({}, "borders");
  const iconsColor = useThemeColor({}, "icons");

  const { searchQuery, setSearchQuery, submitProductSearch } =
    useSellerInventory();
  return (
    <View style={styles.maincontainer}>
      <View style={styles.titlecontainer}>
        <StyledText variant="titleMedium" children="Products" />
        <MaterialIcons name="dashboard-customize" size={24} color="black" />
        <MaterialCommunityIcons name="equal" size={24} color="black" />
      </View>

      {/* Contains the search bar, filter button and add product button */}
      <View style={styles.section}>
        <StyledTextInput
          placeholder="Search Product"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          onSubmitEditing={submitProductSearch}
          returnKeyType="search"
          style={[styles.searchbar, { borderColor: borderColor }]}
        />
        <StyledIconButton
          icon={<MaterialIcons name="filter-list" size={20} color="black" />}
          onPress={() => {}}
          title="Filter"
          variant="icon"
          styles={styles.buttonSection}
          textStyles={{ color: iconsColor }}
        />
        <StyledIconButton
          icon={<MaterialIcons name="add" size={20} color="white" />}
          onPress={() => {
            router.push("/seller/web/products/WebAddProductScreen");
          }}
          variant="icon"
          title="Add Product"
          styles={[styles.buttonSection, styles.addproductbutton, { backgroundColor: buttonColor }]}
          textStyles={styles.addproductbuttontext}
        />
      </View>
    </View>
  );
};

export default ProductNavComponent;

const styles = StyleSheet.create({
  maincontainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
  },
  titlecontainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  section: {
    flexGrow: 1,
    flexDirection: "row",
    gap: 5,
  },
  searchbar: {
    flexShrink: 0,
    maxHeight: 40,
    borderWidth: 1,     
    minHeight: 40,
  },
  buttonSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    borderWidth: 0.3,
    borderColor: "#666",
    borderRadius: 5,
  },
  addproductbutton: {
    boxShadow: "3px 3px 3px 3px rgba(0, 0, 0, 0.1)",  
  },
  addproductbuttontext: {
    color: "white",
    fontSize: 15,
    fontFamily: "BarlowMedium",
    fontWeight: "500",
  },
});
