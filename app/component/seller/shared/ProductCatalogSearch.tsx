import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import { ProductSummary } from "@/app/interfaces/seller/PromotionsInterface";
import { useLazySearchPromotionProductsQuery } from "@/app/store/seller/api/promotionApi";

type ProductCatalogSearchProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedProducts: ProductSummary[];
  onSelectProduct: (product: ProductSummary) => void;
  onRemoveProduct: (productId: string) => void;
  textColor: string;
  iconColor: string;
  borderColor: string;
  buttonColor: string;
  surfaceColor: string;
  selectedChipBackground: string;
  selectedChipTextColor: string;
  emptyHint?: string;
};

const ProductCatalogSearch = ({
  searchTerm,
  onSearchTermChange,
  selectedProducts,
  onSelectProduct,
  onRemoveProduct,
  textColor,
  iconColor,
  borderColor,
  buttonColor,
  surfaceColor,
  selectedChipBackground,
  selectedChipTextColor,
  emptyHint = "Add at least one product.",
}: ProductCatalogSearchProps) => {
  const [searchResults, setSearchResults] = useState<ProductSummary[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [triggerSearch, { isFetching }] = useLazySearchPromotionProductsQuery();

  const selectedIds = useMemo(
    () => new Set(selectedProducts.map((p) => p.id)),
    [selectedProducts]
  );

  const handleSearchPress = useCallback(async () => {
    const q = searchTerm.trim();
    if (!q) {
      setSearchError("Enter a product name to search.");
      setHasSearched(false);
      setSearchResults([]);
      return;
    }

    setSearchError(null);
    try {
      const results = await triggerSearch(q).unwrap();
      const filtered = results.filter((product) => !selectedIds.has(product.id));
      setSearchResults(filtered);
      setHasSearched(true);
      if (results.length === 0) {
        setSearchError("No products matched your search.");
      }
    } catch {
      setSearchResults([]);
      setHasSearched(true);
      setSearchError("Could not load products. Try again.");
    }
  }, [searchTerm, selectedIds, triggerSearch]);

  const handleResultPress = useCallback(
    (product: ProductSummary) => {
      onSelectProduct(product);
      setSearchResults((prev) => prev.filter((p) => p.id !== product.id));
    },
    [onSelectProduct]
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.inputWrap}>
          <StyledTextInput
            label="Search catalog"
            value={searchTerm}
            onChangeText={(value) => {
              onSearchTermChange(value);
              if (searchError) setSearchError(null);
            }}
            placeholder="Type a product name"
            onSubmitEditing={handleSearchPress}
            returnKeyType="search"
          />
        </View>
        <Pressable
          onPress={handleSearchPress}
          style={[styles.searchButton, { borderColor, backgroundColor: surfaceColor }]}
          accessibilityRole="button"
          accessibilityLabel="Search products"
        >
          {isFetching ? (
            <ActivityIndicator size="small" color={buttonColor} />
          ) : (
            <MaterialIcons name="search" size={22} color={buttonColor} />
          )}
        </Pressable>
      </View>

      {searchError ? (
        <StyledText variant="bodySmall" style={styles.errorText}>
          {searchError}
        </StyledText>
      ) : null}

      {hasSearched && searchResults.length > 0 ? (
        <View style={[styles.results, { borderColor, backgroundColor: surfaceColor }]}>
          <StyledText variant="labelSmall" style={{ color: iconColor, paddingHorizontal: 12, paddingTop: 10 }}>
            Tap to add — you can select multiple products
          </StyledText>
          <ScrollView
            style={styles.resultsScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => handleResultPress(product)}
                style={[styles.resultRow, { borderBottomColor: borderColor }]}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add-circle-outline" size={20} color={buttonColor} />
                <StyledText variant="bodyMedium" style={{ color: textColor, flex: 1 }}>
                  {product.name}
                </StyledText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {selectedProducts.length > 0 ? (
        <View style={styles.selectedList}>
          <StyledText variant="labelSmall" style={{ color: iconColor, marginBottom: 4 }}>
            Selected ({selectedProducts.length})
          </StyledText>
          <ScrollView
            style={styles.selectedScroll}
            contentContainerStyle={styles.selectedScrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {selectedProducts.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.selectedRow,
                  { borderColor, backgroundColor: surfaceColor },
                ]}
              >
                <MaterialIcons name="check-circle" size={18} color={buttonColor} />
                <StyledText
                  variant="bodySmall"
                  style={{ color: selectedChipTextColor, flex: 1, fontWeight: "600" }}
                  numberOfLines={1}
                >
                  {product.name}
                </StyledText>
                <TouchableOpacity
                  onPress={() => onRemoveProduct(product.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={18} color={iconColor} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          {emptyHint}
        </StyledText>
      )}
    </View>
  );
};

export default ProductCatalogSearch;

const styles = StyleSheet.create({
  container: { gap: 10 },
  searchRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputWrap: { flex: 1 },
  searchButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  results: {
    borderWidth: 1,
    borderRadius: 12,
    maxHeight: 200,
    overflow: "hidden",
  },
  resultsScroll: {
    maxHeight: 168,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedList: { gap: 8 },
  selectedScroll: {
    maxHeight: 160,
  },
  selectedScrollContent: {
    gap: 8,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: { color: "#D32F2F", paddingHorizontal: 2 },
});
