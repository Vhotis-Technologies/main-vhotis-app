import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import ProductCard from "@/app/component/main/mobile/items/ProductCard";
import { useGetStoreFrontQuery } from "@/app/store/main/api/storeFrontApi";
import { useStoreProducts } from "@/app/hook/main/useMainProducts";
import useMainCart from "@/app/hook/main/useMainCart";

const FLAT_LIST_PERF = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 6,
  windowSize: 5,
  removeClippedSubviews: true,
};

const StoreFrontProductScreen = () => {
  const { storeId, categoryId, categoryName } = useLocalSearchParams<{
    storeId: string;
    categoryId?: string;
    categoryName?: string;
  }>();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const width = useWindowDimensions().width;

  const containerPadding = 8 * 2;
  const rowPadding = 4 * 2;
  const gap = 2;
  const cardWidth = (width - containerPadding - rowPadding - gap) / 2;

  const { addProductToCart, isAddingToCartItem } = useMainCart();

  const { data: storeFrontData } = useGetStoreFrontQuery(storeId || "", {
    skip: !storeId,
  });

  const {
    allProducts: products,
    isInitialLoading,
    isLoadingMore,
    isRefreshing,
    error,
    isEmpty,
    loadMoreProducts,
    onRefresh,
  } = useStoreProducts(
    storeId,
    !storeId,
    typeof categoryId === "string" ? categoryId : undefined
  );

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
    ({ item }: { item: any }) => (
      <ProductCard
        item={item}
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewProductDetails}
        isLoading={isAddingToCartItem(String(item.id))}
        width={cardWidth}
      />
    ),
    [handleAddToCart, handleViewProductDetails, isAddingToCartItem, cardWidth]
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

  if (isInitialLoading) {
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
        <StyledText style={{ marginTop: 10, color: textColor }}>
          Loading products...
        </StyledText>
      </View>
    );
  }

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
          <StyledText
            variant="headlineSmall"
            style={[styles.emptyStateTitle, { color: textColor }]}
          >
            Something Went Wrong
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.emptyStateMessage, { color: textColor }]}
          >
            We're having trouble loading products. Please check your connection
            and try again.
          </StyledText>
        </View>
      </View>
    );
  }

  if (isEmpty) {
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
          <StyledText
            variant="headlineSmall"
            style={[styles.emptyStateTitle, { color: textColor }]}
          >
            No Products Available
          </StyledText>
          <StyledText
            variant="bodyMedium"
            style={[styles.emptyStateMessage, { color: textColor }]}
          >
            This store doesn't have any products available at the moment.
          </StyledText>
        </View>
      </View>
    );
  }

  const storeName = storeFrontData?.data?.store_name || "Store";
  const categoryTitle =
    typeof categoryName === "string" && categoryName.trim()
      ? categoryName.trim()
      : null;

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.header}>
        <StyledText
          variant="titleLarge"
          style={[styles.headerTitle, { color: textColor }]}
        >
          {storeName}
        </StyledText>
        <StyledText
          variant="bodyMedium"
          style={[styles.headerSubtitle, { color: textColor }]}
        >
          {categoryTitle ? categoryTitle : "All Products"}
        </StyledText>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        columnWrapperStyle={styles.row}
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
            colors={["#007AFF"]}
            tintColor="#007AFF"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      />
    </View>
  );
};

export default StoreFrontProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "BarlowBold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    opacity: 0.7,
  },
  productsContainer: {
    padding: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "BarlowBold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    textAlign: "center",
    lineHeight: 22,
  },
});
