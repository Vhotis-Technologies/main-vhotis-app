import {
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import React from "react";
import CartComponent from "@/app/component/main/mobile/cart/CartComponent";
import CartHeaderComponent from "@/app/component/main/mobile/cart/CartHeader";
import CartFooterComponent from "@/app/component/main/mobile/cart/CartFooter";
import EmptyCartComponent from "@/app/component/main/mobile/cart/EmptyCartComponent";
import SavedForLaterComponent from "@/app/component/main/mobile/cart/SavedForLaterComponent";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledText from "@/app/component/helpers/forms/StyledText";
import useMainCart from "@/app/hook/main/useMainCart";
import { useAppSelector } from "@/app/store/store";
import ProductCard from "@/app/component/main/mobile/items/ProductCard";
import {
  useGetRecommendedProductsQuery,
  useGetCoPurchaseProductsQuery,
} from "@/app/store/main/api/cartApi";
import ProductCardInterface from "@/app/interfaces/main/product/Iteminterface";

type RecommendedProduct = ProductCardInterface & {
  score?: number;
  last_interaction?: string | null;
};

type CoPurchaseProduct = ProductCardInterface & {
  score?: number;
};
const CartScreen = () => {
  /* Import colors */
  const backgroundColor = useThemeColor({}, "background");
  const {
    addProductToCart,
    decrementProductFromCart,
    handleDeleteCartItem,
    handleSaveForLater,
    isAddingToCartItem,
    isRemovingFromCartItem,
    isDeletingCartItemById,
    isAddingToWishlistItem,
    handleClearCart,
    isGettingCartItems,
    recentlyViewedItems,
    isGettingRecentlyViewedItems,
    refetchCartItems,
    refetchCartCheckout,
  } = useMainCart();
  const { cartItems } = useAppSelector((state) => state.cart);
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: recommendedProducts,
    isLoading: isGettingRecommendedProducts,
    isError: isGettingRecommendedProductsError,
  } = useGetRecommendedProductsQuery({});
  const recommendedProductList: RecommendedProduct[] =
    recommendedProducts && "recommended_products" in recommendedProducts
      ? (recommendedProducts.recommended_products as RecommendedProduct[]) ?? []
      : [];

  const {
    data: coPurchaseProducts,
    isLoading: isGettingCoPurchaseProducts,
    isError: isGettingCoPurchaseProductsError,
  } = useGetCoPurchaseProductsQuery({});
  const coPurchaseProductList: CoPurchaseProduct[] =
    coPurchaseProducts && "co_purchase_products" in coPurchaseProducts
      ? (coPurchaseProducts.co_purchase_products as CoPurchaseProduct[]) ?? []
      : [];

  const handleViewProductDetails = React.useCallback((productId: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
      params: { id: productId },
    });
  }, []);

  // Refetch cart items & checkout whenever this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      refetchCartItems();
      refetchCartCheckout();
    }, [refetchCartItems, refetchCartCheckout])
  );

  /* Show loading indicator while fetching cart items */
  if (isGettingCartItems) {
    return (
      <View
        style={[
          styles.mainContainer,
          styles.centerContent,
          { backgroundColor },
        ]}
      >
        <ActivityIndicator size="large" color="#0066CC" />
        <StyledText variant="labelMedium" style={styles.loadingText}>
          Loading your cart...
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.mainContainer, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isGettingCartItems}
          onRefresh={refetchCartItems}
          colors={["#007AFF"]}
        />
      }
    >
      <View style={styles.sectionSpacing}>
        {cartItems.length > 0 ? (
          <>
            <CartHeaderComponent
              quantity={cartItems.length}
              onDeleteCart={handleClearCart}
            />
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItemWrapper}>
                <CartComponent
                  cartItems={item}
                  onProductPress={(id) => {
                    router.push({
                      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
                      params: { id: id },
                    });
                  }}
                  onRemove={(id) => {
                    handleDeleteCartItem(id);
                  }}
                  onSaveForLater={(id) => {
                    handleSaveForLater(id);
                  }}
                  onIncrement={(id) => {
                    addProductToCart(id);
                  }}
                  onDecrement={(id) => {
                    decrementProductFromCart(id);
                  }}
                  isAddingToCart={isAddingToCartItem(item.id)}
                  isRemovingFromCart={isRemovingFromCartItem(item.id)}
                  isDeletingCartItem={isDeletingCartItemById(item.cart_item_id)}
                  isAddingToWishlist={isAddingToWishlistItem(item.id)}
                />
              </View>
            ))}
          </>
        ) : (
          <EmptyCartComponent />
        )}
      </View>

      {cartItems.length > 0 && (
        <View style={styles.sectionSpacing}>
          <CartFooterComponent
            onCheckout={() => {
              const shopper = user as { is_guest?: boolean } | null;
              if (shopper?.is_guest) {
                router.push("/onboarding/main/Signin");
                return;
              }
              router.push("/main/mobile/(tabs)/cart/CheckoutScreen");
            }}
            showDeliveryTime={false}
          />
        </View>
      )}

      <View style={styles.sectionSpacing}>
        <SavedForLaterComponent onItemPress={handleViewProductDetails} />
      </View>

      {/* Display the recently viewed items */}
      <View style={[styles.sectionSpacing, styles.recentlyViewedSection]}>
        <View style={styles.recentlyViewedHeader}>
          <StyledText variant="titleSmall" style={styles.sectionHeaderText}>
            Your Recently Viewed Items
          </StyledText>
          {isGettingRecentlyViewedItems && (
            <ActivityIndicator size="small" color="#0066CC" />
          )}
        </View>

        {recentlyViewedItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyViewedList}
          >
            {recentlyViewedItems.map((item, index) => (
              <View key={index} style={styles.recentlyViewedCard}>
                <ProductCard
                  item={item}
                  onAddToCart={addProductToCart}
                  onViewDetails={handleViewProductDetails}
                  isLoading={isAddingToCartItem(item.id)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          !isGettingRecentlyViewedItems && (
            <StyledText variant="bodySmall" style={styles.emptyStateText}>
              No recently viewed items yet.
            </StyledText>
          )
        )}
      </View>

      {/* Display the recommended products */}
      <View style={[styles.sectionSpacing, styles.recentlyViewedSection]}>
        <View style={styles.recentlyViewedHeader}>
          <StyledText variant="titleSmall" style={styles.sectionHeaderText}>
            We Think You'll Like These
          </StyledText>
          {isGettingRecommendedProducts && (
            <ActivityIndicator size="small" color="#0066CC" />
          )}
        </View>

        {recommendedProductList.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyViewedList}
          >
            {recommendedProductList.map(
              (item: RecommendedProduct, index: number) => (
                <View key={index} style={styles.recentlyViewedCard}>
                  <ProductCard
                    item={item}
                    onAddToCart={addProductToCart}
                    onViewDetails={handleViewProductDetails}
                    isLoading={isAddingToCartItem(item.id)}
                  />
                </View>
              )
            )}
          </ScrollView>
        ) : (
          !isGettingRecommendedProducts &&
          !isGettingRecommendedProductsError && (
            <StyledText variant="bodySmall" style={styles.emptyStateText}>
              No recommended products yet.
            </StyledText>
          )
        )}

        {isGettingRecommendedProductsError && (
          <StyledText variant="bodySmall" style={styles.errorStateText}>
            We couldn&apos;t load recommendations right now.
          </StyledText>
        )}
      </View>

      {/* Display the co-purchase products from other user who bought what a user has added in the same cart */}
      <View style={[styles.sectionSpacing, styles.recentlyViewedSection]}>
        <View style={styles.recentlyViewedHeader}>
          <StyledText variant="titleSmall" style={styles.sectionHeaderText}>
            Customers Also Bought
          </StyledText>
          {isGettingCoPurchaseProducts && (
            <ActivityIndicator size="small" color="#0066CC" />
          )}
        </View>

        {coPurchaseProductList.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentlyViewedList}
          >
            {coPurchaseProductList.map(
              (item: CoPurchaseProduct, index: number) => (
                <View key={index} style={styles.recentlyViewedCard}>
                  <ProductCard
                    item={item}
                    onAddToCart={addProductToCart}
                    onViewDetails={handleViewProductDetails}
                    isLoading={isAddingToCartItem(item.id)}
                  />
                </View>
              )
            )}
          </ScrollView>
        ) : (
          !isGettingCoPurchaseProducts &&
          !isGettingCoPurchaseProductsError && (
            <StyledText variant="bodySmall" style={styles.emptyStateText}>
              No co-purchase suggestions yet.
            </StyledText>
          )
        )}

        {isGettingCoPurchaseProductsError && (
          <StyledText variant="bodySmall" style={styles.errorStateText}>
            We couldn&apos;t load co-purchase suggestions right now.
          </StyledText>
        )}
      </View>
    </ScrollView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  sectionSpacing: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  cartItemWrapper: {
    marginBottom: 12,
  },
  recentlyViewedSection: {
    paddingBottom: 10,
  },
  recentlyViewedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  sectionHeaderText: {
    fontWeight: "600",
  },
  recentlyViewedList: {
    paddingHorizontal: 4,
  },
  recentlyViewedCard: {
    width: 200,
    marginHorizontal: 2,
  },
  emptyStateText: {
    paddingHorizontal: 4,
    color: "#666",
  },
  errorStateText: {
    paddingHorizontal: 4,
    color: "#C62828",
  },
});
