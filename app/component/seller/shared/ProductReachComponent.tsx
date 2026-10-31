import { DailyViewsInterface } from "@/app/interfaces/seller/DashboardInterfaces";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import StyledText from "../../helpers/forms/StyledText";
import ProductRowComponent from "./ProductRowComponent";
import { Background } from "@react-navigation/elements";
import { useThemeColor } from "@/hooks/useThemeColor";

interface ProductReachComponentProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  products: {
    [key: string]: DailyViewsInterface;
  };
  isLoading?: boolean; // Add this
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ProductReachComponent = ({
  visible,
  onClose,
  category,
  products,
  isLoading = false, // Add this with default
}: ProductReachComponentProps) => {
  const { width: windowWidth } = useWindowDimensions();

  const backgroundColor = useThemeColor({}, "background");

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.modalContent, { backgroundColor }]}>
        <View style={styles.header}>
          <StyledText
            variant="labelLarge"
            children={`${category} Products Reach`}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButtonContainer}
          >
            <StyledText variant="titleLarge" children="×" />
          </TouchableOpacity>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <StyledText variant="labelSmall" children="0-5k" />
            <View style={[styles.legendBox, { backgroundColor: "#FFE5E5" }]} />
          </View>
          <View style={styles.legendItem}>
            <StyledText variant="labelSmall" children="5k-10k" />
            <View style={[styles.legendBox, { backgroundColor: "#FFCCCC" }]} />
          </View>
          <View style={styles.legendItem}>
            <StyledText variant="labelSmall" children="10k-50k" />
            <View style={[styles.legendBox, { backgroundColor: "#FF9999" }]} />
          </View>
          <View style={styles.legendItem}>
            <StyledText variant="labelSmall" children="50k+" />
            <View style={[styles.legendBox, { backgroundColor: "#FF6666" }]} />
          </View>
        </View>

        <View style={styles.daysContainer}>
          <View style={styles.daysSpacer} />
          {DAYS.map((day) => (
            <View key={day} style={styles.dayContainer}>
              <StyledText variant="labelSmall" children={day} />
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollViewContent}
          nestedScrollEnabled={true}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <StyledText variant="bodyMedium">Loading products...</StyledText>
            </View>
          ) : Object.keys(products).length > 0 ? (
            Object.entries(products).map(([productName, reach]) => (
              <ProductRowComponent
                key={productName}
                productName={productName}
                reach={reach}
              />
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <StyledText variant="bodyMedium">
                No products found in this category
              </StyledText>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    padding: 24,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  modalContentMobile: {
    padding: 16,
    borderRadius: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButtonContainer: {
    padding: 8,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666",
    lineHeight: 24,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendText: {
    fontSize: Platform.OS === "web" ? 12 : 10,
    color: "#666",
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  description: {
    marginBottom: 16,
    fontSize: Platform.OS === "web" ? 14 : 12,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  daysSpacer: {
    width: Platform.OS === "web" ? 100 : 60,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    width: Platform.OS === "web" ? 80 : 40,
    textAlign: "center",
    fontSize: Platform.OS === "web" ? 12 : 10,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
});

export default ProductReachComponent;
