import StyledIconButton from "@/app/component/helpers/buttons/StyledIconButton";
import Actions from "@/app/component/seller/helper/Action";
import { useWidthContext } from "@/app/contexts/WidthProvider";
import { ProductItemInterface } from "@/app/interfaces/seller/ProductInterface";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ProductImageAndDescription from "./ProductImageAndDescription";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

const ProductItems = ({
  id,
  image,
  description,
  name,
  price,
  quantity,
  status,
  rating,
  views,
  onDelete,
  onEdit,
  onPress,
}: ProductItemInterface) => {
  const { windowWidth, screenWidth } = useWidthContext();
  const [isActionsVisible, setIsActionsVisible] = useState(false);

  const tintColor = useThemeColor({}, "tint");

  return (
    <Pressable
      style={styles.maincontainer}
      onPress={() => {
        if (id && onPress) onPress(id);
      }}
    >
      <View style={styles.nameColumn}>
        <ProductImageAndDescription
          id={id}
          image={image}
          description={description}
          name={name}
        />
      </View>
      <StyledText style={styles.priceColumn}>${price}</StyledText>
      <StyledText style={styles.ratingColumn}>{rating}</StyledText>
      <StyledText style={styles.viewsColumn}>{views}</StyledText>
      <StyledText style={styles.statusColumn}>{status}</StyledText>
      <StyledText style={styles.quantityColumn}>{quantity}</StyledText>
      {screenWidth < windowWidth * 0.5 ? (
        <View>
          <Text style={styles.smallScreenText}>Screen too small</Text>
        </View>
      ) : screenWidth < windowWidth * 0.7 ? (
        <View style={styles.buttonContainer}>
          <StyledIconButton
            icon={<MaterialIcons name="edit" size={20} color="white" />}
            variant="icon"
            onPress={() => id && onEdit?.(id)}
            title="Edit"
            styles={styles.editButton}
            textStyles={styles.editButtonText}
          />
          <StyledIconButton
            icon={<MaterialIcons name="delete" size={20} color="red" />}
            variant="icon"
            onPress={() => id && onDelete?.(id)}
          />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={20}
            color={tintColor}
            onPress={() => setIsActionsVisible(!isActionsVisible)}
          />
          {isActionsVisible && (
            <Actions
              onDelete={() => onDelete?.(id ?? "")}
              onEdit={() => onEdit?.(id ?? "")}
              id={id ?? ""}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

export default ProductItems;

const styles = StyleSheet.create({
  maincontainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  nameColumn: {
    flex: 3,
    minWidth: 200,
  },
  priceColumn: {
    flex: 1,
    textAlign: "left",
  },
  ratingColumn: {
    flex: 1,
    textAlign: "left",
  },
  viewsColumn: {
    flex: 1,
    textAlign: "left",
  },
  statusColumn: {
    flex: 1,
    textAlign: "left",
    minWidth: 120,
  },
  quantityColumn: {
    flex: 1,
    textAlign: "left",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    backgroundColor: "blue",
    borderRadius: 5,
    elevation: 5,
    padding: 5,
  },
  editButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "BarlowMedium",
  },
  smallScreenText: {
    flex: 1,
    textAlign: "right",
    color: "gray",
    fontSize: 12,
    fontFamily: "BarlowMedium",
  },
});
