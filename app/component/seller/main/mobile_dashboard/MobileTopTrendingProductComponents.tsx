import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import TopTrendingProductsInterface from "@/app/interfaces/seller/SharedInterfaces";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { formatCurrency } from "@/app/_utils/main/helpers";

interface MobileTopTrendingProductComponentsProps {
  id?: string;
  name: string;
  image?: any;
  price: number;
  sales?: number;
  earning?: number;
  description?: string;
  category?: string;
  quantity?: number;
  onPress: (id: string) => void;
  currency?: string;
}

const MobileTopTrendingProductComponents = ({
  id,
  name,
  image,
  price,
  sales,
  earning,
  onPress,
  currency = "USD",
}: MobileTopTrendingProductComponentsProps) => {

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id || "")}
      style={styles.container}
    >
      <View style={[styles.rowContainer]}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={typeof image === "string" ? { uri: image } : image}
            style={styles.thumbnail}
          />
        </View>

        <View style={styles.contentContainer}>
          <StyledText variant="labelMedium" children={name} />
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <StyledText variant="labelSmall" children="ID" />
              <StyledText variant="labelSmall" children={`#${id}`} />
            </View>
            <View style={styles.detailItem}>
              <StyledText variant="labelSmall" children="Sales" />
              <StyledText variant="labelSmall" children={`${sales}`} />
            </View>
            <View style={styles.detailItem}>
              <StyledText variant="labelSmall" children="Price" />
              <StyledText variant="labelSmall" children={`${formatCurrency(price || 0,)}`} />
            </View>
            <View style={styles.detailItem}>
              <StyledText variant="labelSmall" children="Earning" />
              <StyledText
                variant="labelSmall"
                children={`${formatCurrency(earning || 0)}`}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MobileTopTrendingProductComponents;

const styles = StyleSheet.create({
  container: {
    padding: 1,
  },
  rowContainer: {
    flexDirection: "row",
    borderRadius: 5,
    gap: 5,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    overflow: "hidden",
    borderRadius:10
  },
  contentContainer: {
    flex: 1,
    gap: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: "45%",
  },
});
