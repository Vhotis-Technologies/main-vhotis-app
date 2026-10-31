/**
 * TodaysDealScreen — "Today's Deals" in the mobile header (_layout.tsx).
 *
 * PURPOSE
 * Show every product that sits on a deal active *right now* (all deal types together),
 * not the same as Home's per-type tiles (bogo / percentage / flash_sale / bundle).
 *
 * DATA FLOW
 *   TodaysDealScreen
 *     → useTodaysDealProducts()          (app/hook/main/useMainProducts.ts)
 *     → useGetTodaysDealsQuery()         (app/store/main/api/homeApi.ts)
 *     → GET /api/v1/home/get_todays_deals/?page=&page_size=
 *     → HomeView.get_todays_deals()      (server main/views/home.py)
 *
 * PAGINATION (same pattern as StoreFrontProductScreen / category lists)
 *   - Initial load: isInitialLoading → full-screen spinner
 *   - Scroll near end: onEndReached → loadMoreProducts → page 2, 3, ...
 *   - Pull down: RefreshControl → onRefresh → page 1 refetch
 *   - Footer spinner while isLoadingMore
 *
 * UI
 *   - 2-column FlatList of ProductCard (deal badge comes from item.deal on the API)
 *
 * RELATED (do not use for this screen)
 *   - get_deals_and_promotions + useDealProducts → HomeScreen tiles → MainProductScreen
 */
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { router } from "expo-router";
import StyledText from "@/app/component/helpers/forms/StyledText";
import ProductCard from "@/app/component/main/mobile/items/ProductCard";
import { useTodaysDealProducts } from "@/app/hook/main/useMainProducts";
import useMainCart from "@/app/hook/main/useMainCart";
import { useThemeColor } from "@/hooks/useThemeColor";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";

const FLAT_LIST_PERF = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 6,
  windowSize: 5,
  removeClippedSubviews: true,
};

const TodaysDealScreen = () => {
  const { addProductToCart, isAddingToCartItem } = useMainCart();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const width = useWindowDimensions().width;

  // Paginated list from get_todays_deals (see file header for flow)
  const {
    allProducts,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    isEmpty,
    error,
    loadMoreProducts,
    onRefresh,
  } = useTodaysDealProducts();

  const containerPadding = 10 * 2;
  const rowPadding = 4 * 2;
  const gap = 2;
  const cardWidth = (width - containerPadding - rowPadding - gap) / 2;

  const handleAddToCart = useCallback(
    (productId: string) => {
      addProductToCart(productId);
    },
    [addProductToCart]
  );

  const handleViewProductDetails = useCallback((productId: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
      params: { id: productId },
    });
  }, []);

  const renderProduct = useCallback(
    ({ item }: { item: ProductCardInterface }) => (
      <ProductCard
        item={item}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewProductDetails}
        isLoading={isAddingToCartItem(String(item.id))}
        width={cardWidth}
      />
    ),
    [cardWidth, handleAddToCart, handleViewProductDetails, isAddingToCartItem]
  );

  /** Shown at the bottom while the next page is fetching */
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={tintColor} />
        <StyledText style={styles.footerLoaderText}>Loading more...</StyledText>
      </View>
    );
  }, [isLoadingMore, tintColor]);

  const keyExtractor = useCallback(
    (item: ProductCardInterface, index: number) =>
      item.id != null ? String(item.id) : `deal-product-${index}`,
    []
  );

  if (isInitialLoading) {
    return (
      <View
        style={[
          styles.mainContainer,
          styles.centered,
          { backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <StyledText style={[styles.statusText, { color: textColor }]}>
          Loading today&apos;s deals...
        </StyledText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.mainContainer,
          styles.centered,
          { backgroundColor, paddingHorizontal: 20 },
        ]}
      >
        <StyledText variant="headlineSmall" style={{ color: textColor }}>
          Something Went Wrong
        </StyledText>
        <StyledText variant="bodyMedium" style={styles.statusText}>
          We couldn&apos;t load today&apos;s deals. Pull down to try again.
        </StyledText>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View
        style={[
          styles.mainContainer,
          styles.centered,
          { backgroundColor, paddingHorizontal: 20 },
        ]}
      >
        <StyledText variant="headlineSmall" style={{ color: textColor }}>
          No Deals Nearby
        </StyledText>
        <StyledText variant="bodyMedium" style={styles.statusText}>
          There are no active deals near your delivery address right now. Check
          back later or update your delivery location on Home.
        </StyledText>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor }]}>
      <FlatList
        data={allProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        extraData={isAddingToCartItem}
        {...FLAT_LIST_PERF}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[tintColor]}
            tintColor={tintColor}
          />
        }
      />
    </View>
  );
};

export default TodaysDealScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 24,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  statusText: {
    marginTop: 10,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  footerLoaderText: {
    marginTop: 8,
  },
});
