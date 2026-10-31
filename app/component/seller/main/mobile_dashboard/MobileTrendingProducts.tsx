import { StyleSheet, View, ScrollView } from "react-native";
import React from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import TopTrendingProductsInterface from "@/app/interfaces/seller/SharedInterfaces";
import MobileTopTrendingProductComponents from "./MobileTopTrendingProductComponents";
import EmptyState from "@/app/component/helpers/EmptyState";
import { useThemeColor } from "@/hooks/useThemeColor";

interface MobileTrendingProductsProps {
  data: TopTrendingProductsInterface[];
  onProductPress?: (id: string) => void;
}

const MobileTrendingProducts = ({
  data,
  onProductPress,
}: MobileTrendingProductsProps) => {
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, 'tint');

  // Check if data is empty or undefined
  if (!data || data.length === 0) {
    return (
      <View style={[styles.section, { borderColor }]}>
        <EmptyState
          title="No Trending Products"
          subtitle="Your trending products will appear here once you start selling"
          iconName="trending-up"
          style={styles.emptyState}
        />
      </View>
    );
  }

  return (
    <View style={[styles.section, { borderColor, backgroundColor, shadowColor: primaryColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {data.map((item, index) => (
          <View key={index} style={[styles.card]}>
            <MobileTopTrendingProductComponents
              id={item.id}
              name={item.name ?? ""}
              image={item.image}
              price={item.price ?? 0}
              sales={item.sales ?? 0}
              earning={item.earning ?? 0}
              onPress={() => onProductPress?.(item.id ?? "")}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MobileTrendingProducts;

const styles = StyleSheet.create({
  section: {
    borderRadius: 5,
    padding: 5,
  },
  scrollView: {
    maxHeight: 300,
  },
  card: {
    marginBottom: 2,
  },
  emptyState: {
    minHeight: 150,
  },
});
