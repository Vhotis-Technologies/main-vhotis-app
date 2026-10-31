import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React from "react";
import ProductSideDetailsComponent from "./ProductSideDetailsComponent";
import StyledIconButton from "@/app/component/helpers/buttons/StyledIconButton";
import { MaterialIcons } from "@expo/vector-icons";
import CategoryAndSub from "./CategoryAndSub";
import { useThemeColor } from "@/hooks/useThemeColor";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import { TrendingCategoryInterface } from "@/app/interfaces/main/home/HomeInterfaces";

const AddCategorie = ({
  onPress,
  categories,
  subcategories,
  isLoadingCategories,
}: {
  onPress: () => void;
  categories: TrendingCategoryInterface[];
  subcategories: any[];
  isLoadingCategories: boolean;
}) => {
  const textColor = useThemeColor({}, "text");
  const { handleProductUpdate, currentProduct } = useSellerInventory();

  const handleCategoryPress = (categoryId: number) => {
    handleProductUpdate({
      field: "category",
      value: categoryId,
    });
  };

  const isCategorySelected = (categoryId: number) => {
    if (!currentProduct?.category) return false;
    return currentProduct.category === categoryId.toString();
  };

  // Debug: Log categories and current product
  console.log("AddCategorie - Categories received:", categories);
  console.log("AddCategorie - Current product:", currentProduct);

  return (
    <View style={styles.maincontainer}>
      <View style={styles.leftsection}>
        <ProductSideDetailsComponent
          title="Category"
          body="Select the category that best describes your product"
        />
      </View>

      <View style={styles.rightsection}>
        {isLoadingCategories ? (
          <ActivityIndicator size="large" color={textColor} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.isArray(categories) &&
              categories.map((category, index) => (
                <View
                  key={category.id || index}
                  style={styles.categorycontainer}
                >
                  <CategoryAndSub
                    key={category.id || index}
                      title={category.title}
                    icon={
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={24}
                        color={textColor}
                      />
                    }
                    variant="category"
                    onPress={() => handleCategoryPress(category.id!)}
                    isSelected={isCategorySelected(category.id!)}
                  />  
                </View>
              ))}
          </ScrollView>
        )}
        {/* Subcategories */}

        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {subcategories.map((subcategory, index) => (
            <View key={index} style={styles.categorycontainer}>
              <CategoryAndSub
                key={index}
                title={subcategory}
                onPress={onPress}
                variant="subcategory"
              />
            </View>
          ))}
        </ScrollView> */}
      </View>
    </View>
  );
};

export default AddCategorie;

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
    borderStyle: "dashed",
    borderColor: "#000000",
    paddingVertical: 15,
  },
  categorycontainer: {
    marginHorizontal: 5,
  },
});
