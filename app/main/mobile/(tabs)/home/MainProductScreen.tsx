import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import ProductCard from "@/app/component/main/mobile/items/ProductCard";
import {
  useMainProducts,
  useCategoryProducts,
  useDealProducts,
} from "@/app/hook/main/useMainProducts";
import ProductFilterModal, {
  PriceRange,
  RatingFilter,
} from "@/app/component/helpers/others/ProductFilterModal";
import { FilterOptionValue } from "@/app/component/helpers/others/FilterProductComponent";
import { MaterialIcons } from "@expo/vector-icons";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import useMainCart from "@/app/hook/main/useMainCart";

const FLAT_LIST_PERF = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 6,
  windowSize: 5,
  removeClippedSubviews: true,
};

const parseDistance = (distanceText?: string | number) => {
  if (!distanceText) return Number.POSITIVE_INFINITY;
  if (typeof distanceText === "number") return distanceText;
  const match = distanceText.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Number.POSITIVE_INFINITY;
};

const getProductPrice = (product: any) => {
  const price =
    typeof product.selling_price === "number" &&
    !Number.isNaN(product.selling_price)
      ? product.selling_price
      : product.price;
  return typeof price === "number" && !Number.isNaN(price)
    ? price
    : Number.POSITIVE_INFINITY;
};

const MainProductScreen = () => {
  const [selectedFilter, setSelectedFilter] =
    useState<FilterOptionValue | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange>(null);
  const [selectedRating, setSelectedRating] = useState<RatingFilter>(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const backgroundColor = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "icons");
  const width = useWindowDimensions().width;

  // Calculate card width: (screen width - container padding - row padding - gap) / 2
  const containerPadding = 5 * 2; // paddingHorizontal: 5 on each side from productsContainer
  const rowPadding = 4 * 2; // paddingHorizontal: 4 on each side in row style
  const gap = 2; // marginHorizontal: 1 on each card = 2 total gap
  const cardWidth = (width - containerPadding - rowPadding - gap) / 2;

  // Modal service for showing filter modal
  const { showSheetModal, closeModal, isModalVisible } = useModalService();

  /* Get the search params for the required fields */
  const { searchQuery } = useLocalSearchParams<{ searchQuery?: string }>();
  const { categoryId } = useLocalSearchParams<{
    categoryId: string;
  }>();
  const { dealType } = useLocalSearchParams<{
    dealType: string;
  }>();

  const mode = searchQuery
    ? "search"
    : categoryId
    ? "category"
    : dealType
    ? "deal"
    : null;

  // Get cart methods for product interactions
  const { addProductToCart, isAddingToCartItem } = useMainCart();

  const search = useMainProducts(searchQuery, mode !== "search");
  const category = useCategoryProducts(categoryId, mode !== "category");
  const deals = useDealProducts(dealType, mode !== "deal");

  const activeList =
    mode === "search"
      ? search
      : mode === "category"
      ? category
      : mode === "deal"
      ? deals
      : null;

  const rawProducts = activeList?.allProducts ?? [];
  const isLoading = activeList?.isInitialLoading ?? false;
  const error = activeList?.error ?? null;
  const isEmpty = activeList?.isEmpty ?? true;
  const loadMoreProducts = activeList?.loadMoreProducts ?? (() => {});
  const onRefresh = activeList?.onRefresh ?? (() => {});
  const isRefreshing = activeList?.isRefreshing ?? false;
  const isLoadingMore = activeList?.isLoadingMore ?? false;

  const handleAddToCartFromSearch = search.handleAddToCart;
  const handleViewProductDetailsFromSearch = search.handleViewProductDetails;
  const getProductLoadingStateFromSearch = search.getProductLoadingState;

  /* Handle add to cart */
  const handleAddToCart = useCallback(
    (productId: string) => {
      if (mode === "search") {
        handleAddToCartFromSearch(productId);
        return;
      }
      addProductToCart(productId);
    },
    [mode, handleAddToCartFromSearch, addProductToCart]
  );

  /* Handle view product details */
  const handleViewProductDetails = useCallback(
    (productId: string) => {
      if (mode === "search") {
        handleViewProductDetailsFromSearch(productId);
        return;
      }
      router.push({
        pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
        params: { id: productId },
      });
    },
    [mode, handleViewProductDetailsFromSearch]
  );

  const displayedProducts = useMemo(() => {
    let filtered = [...rawProducts];

    if (selectedPriceRange) {
      const maxPrice = {
        under_25: 25,
        under_50: 50,
        under_100: 100,
        under_200: 200,
      }[selectedPriceRange];

      filtered = filtered.filter((product) => {
        const price = getProductPrice(product);
        return price <= maxPrice && price !== Number.POSITIVE_INFINITY;
      });
    }

    if (selectedRating) {
      filtered = filtered.filter((product) => {
        const rating = product.rating ?? 0;
        return rating >= selectedRating;
      });
    }

    if (selectedFilter) {
      switch (selectedFilter) {
        case "price_low_to_high":
          filtered.sort((a, b) => getProductPrice(a) - getProductPrice(b));
          break;
        case "price_high_to_low":
          filtered.sort((a, b) => getProductPrice(b) - getProductPrice(a));
          break;
        case "rating":
          filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
          break;
        case "distance_closest_first":
          filtered.sort(
            (a, b) => parseDistance(a.distance) - parseDistance(b.distance)
          );
          break;
        case "distance_furthest_first":
          filtered.sort(
            (a, b) => parseDistance(b.distance) - parseDistance(a.distance)
          );
          break;
        case "sponsored":
          filtered = filtered.filter((product: any) => product.is_sponsored);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [rawProducts, selectedFilter, selectedPriceRange, selectedRating]);

  const renderProduct = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        item={item}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewProductDetails}
        isLoading={
          mode === "search"
            ? getProductLoadingStateFromSearch(String(item.id))
            : isAddingToCartItem(String(item.id))
        }
        width={cardWidth}
      />
    ),
    [
      mode,
      handleAddToCart,
      handleViewProductDetails,
      getProductLoadingStateFromSearch,
      isAddingToCartItem,
      cardWidth,
    ]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="blue" />
        <StyledText style={styles.footerLoaderText}>Loading more...</StyledText>
      </View>
    );
  }, [isLoadingMore]);

  const keyExtractor = useCallback(
    (item: { id?: string }, index: number) =>
      item.id?.toString() ?? `product-${index}`,
    []
  );

  const isFilterActive =
    !!selectedFilter || !!selectedPriceRange || !!selectedRating;

  /* Show loading state for initial load */
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="blue" />
        <StyledText style={{ marginTop: 10 }}>Loading products...</StyledText>
      </View>
    );
  }

  /* Show error state */
  if (error) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          },
        ]}
      >
        <View style={styles.emptyStateContainer}>
          <StyledText variant="headlineSmall" style={styles.emptyStateTitle}>
            Something Went Wrong
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.emptyStateMessage}>
            We're having trouble loading products. Please check your connection
            and try again.
          </StyledText>
        </View>
      </View>
    );
  }

  /* Show empty state */
  if (isEmpty) {
    const getEmptyStateMessage = () => {
      if (mode === "search") {
        return `We couldn't find any products matching "${searchQuery}" near your delivery area.`;
      } else if (mode === "category") {
        return "No products in this category are available near your delivery address.";
      } else if (mode === "deal") {
        return "No deals are available near your delivery area right now.";
      }
      return "No products available near your delivery area.";
    };

    const getEmptyStateTitle = () => {
      if (mode === "search") return "No Results Found";
      if (mode === "category") return "No Products Nearby";
      if (mode === "deal") return "No Deals Nearby";
      return "No Products Nearby";
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundColor,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          },
        ]}
      >
        <View style={styles.emptyStateContainer}>
          <StyledText variant="headlineSmall" style={styles.emptyStateTitle}>
            {getEmptyStateTitle()}
          </StyledText>
          <StyledText variant="bodyMedium" style={styles.emptyStateMessage}>
            {getEmptyStateMessage()}
          </StyledText>
          {mode === "search" && (
            <StyledText variant="bodySmall" style={styles.emptyStateSuggestion}>
              Try searching with different keywords or check back later for new
              products.
            </StyledText>
          )}
        </View>
      </View>
    );
  }

  const handleApplyFilters = (filters: {
    sort?: FilterOptionValue | null;
    priceRange?: PriceRange;
    rating?: RatingFilter;
  }) => {
    setSelectedFilter(filters.sort || null);
    setSelectedPriceRange(filters.priceRange || null);
    setSelectedRating(filters.rating || null);
  };

  const handleClearFilters = () => {
    setSelectedFilter(null);
    setSelectedPriceRange(null);
    setSelectedRating(null);
  };

  // Open filter modal using ModalServiceProvider
  const openFilterModal = () => {
    const filterModalContent = (
      <ProductFilterModal
        selectedSort={selectedFilter}
        selectedPriceRange={selectedPriceRange}
        selectedRating={selectedRating}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        allProducts={rawProducts}
        getProductPrice={getProductPrice}
        parseDistance={parseDistance}
        setIsFilterOpen={(isOpen: boolean) => {
          if (!isOpen) {
            closeModal();
          }
        }}
        setActiveFilterCount={setActiveFilterCount}
      />
    );

    showSheetModal(filterModalContent, "Filter Products", () => {
      console.log("Filter modal closed");
    });
  };

  // Get header title based on mode
  const getHeaderTitle = () => {
    if (mode === "search") {
      return `Search results for "${searchQuery}"`;
    } else if (mode === "category") {
      return "Category Products";
    } else if (mode === "deal") {
      const dealTypeLabels: Record<string, string> = {
        bogo: "Buy 1 Get 1 Free",
        percentage: "Percentage Off",
        flash_sale: "Flash Sale",
        bundle: "Bundle Deals",
        fixed: "Fixed Price Deals",
      };
      return dealTypeLabels[dealType || ""] || "Deals & Promotions";
    }
    return "Products";
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.header}>
        {mode && (
          <View style={styles.searchHeader}>
            <StyledText variant="labelMedium">{getHeaderTitle()}</StyledText>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            if (isModalVisible) {
              closeModal();
            } else {
              openFilterModal();
            }
          }}
          style={[
            styles.filterButton,
            { backgroundColor, shadowColor: "white" },
          ]}
        >
          <StyledText variant="bodySmall">
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </StyledText>
          <MaterialIcons name="filter-list" size={15} color={iconColor} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isFilterActive ? (
            <View style={styles.filteredEmptyState}>
              <StyledText variant="bodyMedium">
                No products match this filter yet.
              </StyledText>
            </View>
          ) : null
        }
        extraData={isAddingToCartItem}
        {...FLAT_LIST_PERF}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]} // Android
            tintColor="#007AFF" // iOS
            title="Pull to refresh" // iOS
            titleColor="#666" // iOS
          />
        }
      />
    </View>
  );
};

export default MainProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },

  filterButton: {
    padding: 5,
    paddingHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    borderRadius: 5,
    flexDirection: "row",
    gap: 5,
  },

  productsContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },

  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },

  footerLoaderText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },

  filterHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    letterSpacing: 0.5,
  },

  filterMenu: {
    padding: 16,
    borderRadius: 8,
    minWidth: 200,
  },

  filterOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  searchHeader: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyStateTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },

  emptyStateMessage: {
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.7,
    lineHeight: 20,
  },

  emptyStateSuggestion: {
    textAlign: "center",
    opacity: 0.5,
    fontStyle: "italic",
    lineHeight: 18,
  },

  filteredEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
});
