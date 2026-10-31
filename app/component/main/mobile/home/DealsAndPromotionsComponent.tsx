import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface WebHomeGridItem {
  image: any; // require or uri
  label: string;
  onPress?: () => void;
}

interface DealsAndPromotionsInterface {
  item1: WebHomeGridItem;
  item2: WebHomeGridItem;
  item3: WebHomeGridItem;
  item4: WebHomeGridItem;
  linkText?: string;
  onLinkPress?: () => void;
  style?: any;
}

const DealsAndPromotionsComponent: React.FC<DealsAndPromotionsInterface> = ({
  item1,
  item2,
  item3,
  item4,
  style,
}) => {
  const cardColor = useThemeColor({}, "cards");
  return (
    <View style={[styles.card, style]}>
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={item1.onPress}
          activeOpacity={item1.onPress ? 0.7 : 1}
        >
          <Image
            source={
              typeof item1.image === "string"
                ? { uri: item1.image }
                : item1.image
            }
            style={styles.image}
            contentFit="cover"
          />
          <StyledText style={styles.label} children={item1.label} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={item2.onPress}
          activeOpacity={item2.onPress ? 0.7 : 1}
        >
          <Image
            source={
              typeof item2.image === "string"
                ? { uri: item2.image }
                : item2.image
            }
            style={styles.image}
            contentFit="cover"
          />
          <StyledText style={styles.label} children={item2.label} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={item3.onPress}
          activeOpacity={item3.onPress ? 0.7 : 1}
        >
          <Image
            source={
              typeof item3.image === "string"
                ? { uri: item3.image }
                : item3.image
            }
            style={styles.image}
            contentFit="cover"
          />
          <StyledText style={styles.label} children={item3.label} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={item4.onPress}
          activeOpacity={item4.onPress ? 0.7 : 1}
        >
          <Image
            source={
              typeof item4.image === "string"
                ? { uri: item4.image }
                : item4.image
            }
            style={styles.image}
            contentFit="cover"
          />
          <StyledText style={styles.label} children={item4.label} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
    width: "100%",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 0,
    width: "100%",
  },
  gridItem: {
    width: "49%",
    height: 250,
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "90%",
    marginBottom: 6,
    borderRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  mainContent: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
});

export default DealsAndPromotionsComponent;
