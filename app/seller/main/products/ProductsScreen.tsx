import StyledText from "@/app/component/helpers/forms/StyledText";
import SellerProductItem from "@/app/component/seller/main/products/SellerProductItem";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import ProductCatalogFilters from "@/app/component/seller/shared/ProductCatalogFilters";
import useSellerInventory from "@/app/hook/seller/useSellerInventory";
import useFulfillmentStatus from "@/app/hook/seller/useFulfillmentStatus";
import { useAppSelector } from "@/app/store/store";
import type { Seller } from "@/app/interfaces/main/Authentication";
import type { ProductReturnInterface } from "@/app/interfaces/seller/ProductInterface";
import ProductEditModal from "@/app/component/seller/main/products/ProductEditModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

/* This view is just a bridge that would enable the user select the type of product they want to add. 
    It is important for user experience. */
const AddProductTypeBridge = ({
  onSingleProductPress,
  onBulkProductPress,
  showBulk = true,
}: {
  onSingleProductPress: () => void;
  onBulkProductPress: () => void;
  showBulk?: boolean;
}) => {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const iconColor = useThemeColor({}, "icons");

  return (
    <View style={styles.addProductBridgeContainer}>
      <StyledText
        variant="bodyMedium"
        style={[styles.addProductBridgeSubtitle, { color: textColor }]}
      >
        How would you like to add products to your store?
      </StyledText>

      <TouchableOpacity
        style={[
          styles.addProductOption,
          { backgroundColor: cardColor, borderColor },
        ]}
        onPress={onSingleProductPress}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.addProductOptionIcon,
            { backgroundColor: `${buttonColor}18` },
          ]}
        >
          <MaterialIcons name="add-box" size={24} color={buttonColor} />
        </View>
        <View style={styles.addProductOptionCopy}>
          <StyledText
            variant="titleSmall"
            style={[styles.addProductOptionTitle, { color: textColor }]}
          >
            Single product
          </StyledText>
          <StyledText
            variant="bodySmall"
            style={[styles.addProductOptionDescription, { color: iconColor }]}
          >
            Create one product listing manually.
          </StyledText>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={iconColor} />
      </TouchableOpacity>

      {showBulk ? (
        <TouchableOpacity
          style={[
            styles.addProductOption,
            { backgroundColor: cardColor, borderColor },
          ]}
          onPress={onBulkProductPress}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.addProductOptionIcon,
              { backgroundColor: `${buttonColor}18` },
            ]}
          >
            <MaterialIcons name="playlist-add" size={24} color={buttonColor} />
          </View>
          <View style={styles.addProductOptionCopy}>
            <StyledText
              variant="titleSmall"
              style={[styles.addProductOptionTitle, { color: textColor }]}
            >
              Bulk products
            </StyledText>
            <StyledText
              variant="bodySmall"
              style={[styles.addProductOptionDescription, { color: iconColor }]}
            >
              Add multiple products in one flow. using a CSV file.
            </StyledText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={iconColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const ProductsScreen = () => {
  const backgroundColor = useThemeColor({}, "background");
  const buttonColor = useThemeColor({}, "button");
  const textColor = useThemeColor({}, "text");
  const user = useAppSelector((s) => s.auth.user) as Seller | null;
  const { status: fulfillmentStatus } = useFulfillmentStatus();
  const isFulfillmentActive = fulfillmentStatus === "active";
  const isFulfillmentMode = user?.operating_mode === "fulfillment";

  const { showFullscreenModal, showCenterModal, closeModal } =
    useModalService();

  const {
    searchQuery,
    setSearchQuery,
    submitProductSearch,
    clearProductSearch,
    isFetchingProducts,
    isLoadingMore,
    allProducts,
    isRefreshing,
    isInitialLoading,
    loadMoreProducts,
    onRefresh,
    handleDeleteProduct,
    handleUpdateProduct,
    categories,
    isLoadingCategories,
    selectedCategory,
    setSelectedCategory,
    sellerStores,
    isLoadingSellerStores,
    selectedCatalogStoreId,
    setSelectedCatalogStoreId,
    listingStatusFilter,
    setListingStatusFilter,
    isFulfillmentList,
  } = useSellerInventory({ enableBulkImports: !isFulfillmentActive });

  const showFulfillmentUi = isFulfillmentActive || isFulfillmentList;
  const listData = allProducts || [];

  // Draggable FAB state
  const buttonSize = 60;
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const containerWidth = useSharedValue(screenWidth);
  const containerHeight = useSharedValue(screenHeight);

  // Initial position (bottom-right corner) - use screen dimensions as fallback
  const left = useSharedValue(screenWidth - buttonSize - 20);
  const top = useSharedValue(screenHeight - buttonSize - 40);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Update button position when container dimensions are available
  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      containerWidth.value = width;
      containerHeight.value = height;
      // Position button in bottom-right corner
      left.value = width - buttonSize - 20;
      top.value = height - buttonSize - 40;
    }
  }, []);

  /* Pan gesture is used to move around the button around the screen */
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = left.value;
      startY.value = top.value;
    })
    .onUpdate((event) => {
      // Calculate new position
      let newX = startX.value + event.translationX;
      let newY = startY.value + event.translationY;

      // Keep button within container bounds
      const maxX = Math.max(0, containerWidth.value - buttonSize);
      const maxY = Math.max(0, containerHeight.value - buttonSize);

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      left.value = newX;
      top.value = newY;
    })
    .onEnd(() => {});

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: left.value,
      top: top.value,
    };
  });

  const handleProductPress = (productId: string | null) => {
    if (!productId) return;
    router.push({
      pathname: "/seller/main/products/ProductDetailScreen",
      params: { productId },
    });
  };

  const handleProductEdit = useCallback(
    (productId: string | null) => {
      showFullscreenModal(
        <ProductEditModal productId={productId} onSave={handleUpdateProduct} />,
        "Edit Product",
      );
    },
    [showFullscreenModal, handleUpdateProduct],
  );

  const renderProductItem = useCallback(
    ({ item }: { item: ProductReturnInterface }) => {
      const warehouseAvailable = item.warehouse_available;
      const displayQuantity =
        warehouseAvailable != null ? warehouseAvailable : item.quantity;

      return (
        <SellerProductItem
          id={item.id}
          name={item.name}
          description={item.description || ""}
          price={item.price}
          quantity={displayQuantity}
          status={item.status}
          rating={item.rating}
          views={item.views}
          image={item.image}
          images={item.images}
          videos={item.videos}
          category={item.category}
          size={item.size}
          weight={item.weight}
          listingStatus={item.listing_status}
          warehouseAvailable={warehouseAvailable}
          warehouseOnHand={item.warehouse_on_hand}
          warehouseReserved={item.warehouse_reserved}
          blockerLabels={item.blocker_labels}
          sellerSku={item.seller_sku}
          onDelete={() => handleDeleteProduct(item.id ?? "")}
          onEdit={() => handleProductEdit(item.id ?? null)}
          onPress={() => handleProductPress(item.id ?? null)}
        />
      );
    },
    [handleDeleteProduct, handleProductEdit],
  );
  const handleSingleProductPress = useCallback(() => {
    closeModal();
    router.push("/seller/main/products/InventoryScreen");
  }, [closeModal]);

  const handleBulkProductPress = useCallback(() => {
    closeModal();
    router.push({
      pathname: "/seller/main/products/BulkInventoryScreen",
    });
  }, [closeModal]);

  /* Call this function to show the add product type bridge. */
  const handleAddProductPress = useCallback(() => {
    if (isFulfillmentActive) {
      router.push("/seller/main/store/fufillment/ManifestBuilderScreen");
      return;
    }
    showCenterModal(
      <AddProductTypeBridge
        onSingleProductPress={handleSingleProductPress}
        onBulkProductPress={handleBulkProductPress}
        showBulk={!isFulfillmentMode}
      />,
      "Add Product",
    );
  }, [
    handleBulkProductPress,
    handleSingleProductPress,
    showCenterModal,
    isFulfillmentActive,
    isFulfillmentMode,
  ]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }, [isLoadingMore]);

  return (
    <React.Fragment>
      <View
        style={[styles.container, { backgroundColor }]}
        onLayout={onContainerLayout}
      >
        {isInitialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <StyledText style={styles.loadingText}>
              Loading products...
            </StyledText>
          </View>
        ) : (
          <FlatList
            data={listData}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            renderItem={renderProductItem}
            keyExtractor={(item) => String(item.id ?? "")}
            ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inventory" size={64} color={textColor} />
                <StyledText style={[styles.emptyText, { color: textColor }]}>
                  {showFulfillmentUi
                    ? "No catalog products yet"
                    : selectedCategory
                      ? "You do not have any product in this category"
                      : "You do not have any products"}
                </StyledText>
                <StyledText style={[styles.emptySubtext, { color: textColor }]}>
                  {showFulfillmentUi
                    ? "Book an inbound shipment to add products"
                    : "Tap the + button to add your first product"}
                </StyledText>
              </View>
            }
            ListHeaderComponent={
              <ProductCatalogFilters
                search={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={submitProductSearch}
                onSearchClear={clearProductSearch}
                isSearching={isFetchingProducts && !isLoadingMore}
                categories={categories || []}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                isLoadingCategories={isLoadingCategories}
                stores={sellerStores}
                selectedStoreId={selectedCatalogStoreId}
                onSelectStore={setSelectedCatalogStoreId}
                onSelectAllStores={() => setSelectedCatalogStoreId(null)}
                isLoadingStores={isLoadingSellerStores}
                showStoreFilter={
                  sellerStores.length > 1 || isLoadingSellerStores
                }
                showListingFilter={showFulfillmentUi}
                selectedListingStatus={listingStatusFilter}
                onSelectListingStatus={setListingStatusFilter}
              />
            }
          />
        )}
      </View>

      {/* This is the overlay button to add a new product - now draggable */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.bottomButtonContainer, animatedStyle]}>
          <TouchableOpacity
            style={[
              styles.listfootercomponentbutton,
              { backgroundColor: buttonColor },
            ]}
            onPress={handleAddProductPress}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </React.Fragment>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  headerContainer: {
    alignItems: "center",
  },
  headercomponent: {
    width: "100%",
    padding: 10,
  },
  bottomButtonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  listfootercomponentbutton: {
    padding: 20,
    width: "100%",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  addProductBridgeContainer: {
    gap: 12,
    minWidth: 280,
    paddingTop: 4,
  },
  addProductBridgeSubtitle: {
    lineHeight: 20,
    marginBottom: 4,
  },
  addProductOption: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  addProductOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addProductOptionCopy: {
    flex: 1,
  },
  addProductOptionTitle: {
    fontWeight: "600",
  },
  addProductOptionDescription: {
    marginTop: 3,
  },
});
