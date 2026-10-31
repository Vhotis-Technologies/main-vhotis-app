import { StyleSheet, View, TouchableOpacity, FlatList } from "react-native";
import React, { useMemo, useState } from "react";
import { Searchbar } from "react-native-paper";
import {
  ProductInterface,
  ProductReturnInterface,
} from "@/app/interfaces/seller/ProductInterface";
import { useGetProductsListQuery } from "@/app/store/seller/api/inventoryApi";
import StyledText from "@/app/component/helpers/forms/StyledText";

interface ProductSelectorProps {
  selectedProduct: ProductInterface | null;
  onProductSelect: (product: ProductInterface) => void;
}

const ProductSelector = ({
  selectedProduct,
  onProductSelect,
}: ProductSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

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
    onProductSelect({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price || 0,
    } as ProductInterface);
  };

  const renderProductItem = ({ item }: { item: ProductReturnInterface }) => {
    const isSelected = selectedProduct?.id === item.id;
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
      <Searchbar
        placeholder="Search products"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  searchBar: {
    marginBottom: 8,
  },
  productList: {
    maxHeight: 200,
  },
  productListContent: {
    paddingBottom: 10,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
});

export default ProductSelector;
