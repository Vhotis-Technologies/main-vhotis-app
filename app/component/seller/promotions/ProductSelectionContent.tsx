import { StyleSheet, View, TouchableOpacity, FlatList } from "react-native";
import React, { useMemo, useState } from "react";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useGetProductsListQuery } from "@/app/store/seller/api/inventoryApi";
import { ProductReturnInterface } from "@/app/interfaces/seller/ProductInterface";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { useModalService } from "@/app/contexts/ModalServiceProvider";

interface ProductSelectionContentProps {
  onProductSelect: (product: { id: string; name: string }) => void;
  selectedProductIds: string[];
  onComplete?: () => void;
}

const ProductSelectionContent: React.FC<ProductSelectionContentProps> = ({
  onProductSelect,
  selectedProductIds = [],
  onComplete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { closeModal } = useModalService();

  const { data, isLoading: isLoadingProducts } = useGetProductsListQuery({
    page: 1,
    pageSize: 50,
    search: searchQuery.trim() || undefined,
  });

  const products = useMemo(
    () => data?.results ?? [],
    [data?.results],
  );

  const handleProductSelect = (product: ProductReturnInterface) => {
    if (product.id && product.name) {
      onProductSelect({ id: product.id, name: product.name });
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    closeModal();
  };

  const renderProductItem = ({ item }: { item: ProductReturnInterface }) => {
    const isSelected = selectedProductIds.includes(item.id || "");
    return (
      <TouchableOpacity
        style={[styles.productItem, isSelected && styles.selectedProductItem]}
        onPress={() => handleProductSelect(item)}
      >
        <View style={styles.productInfo}>
          <StyledText variant="labelMedium" style={styles.productName}>
            {item.name}
          </StyledText>
          <StyledText variant="bodySmall" style={styles.productId}>
            ID: {item.id}
          </StyledText>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <StyledText variant="labelLarge" style={styles.checkmarkText}>
              ✓
            </StyledText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <StyledTextInput
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoadingProducts ? (
        <View style={styles.loadingContainer}>
          <StyledText variant="bodyMedium">Loading products...</StyledText>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <StyledText variant="bodyMedium">
            {searchQuery
              ? "No products found matching your search"
              : "No products available"}
          </StyledText>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          style={styles.productList}
          contentContainerStyle={styles.productListContent}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleComplete}>
          <StyledText variant="labelMedium" style={styles.doneButtonText}>
            Done ({selectedProductIds.length} selected)
          </StyledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductSelectionContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    paddingBottom: 10,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedProductItem: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    borderWidth: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  productId: {
    color: "#666",
    fontSize: 12,
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  doneButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
  },
});
