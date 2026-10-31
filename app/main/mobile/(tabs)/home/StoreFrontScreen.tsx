import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image,
  Linking,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useStoreFront from "@/app/hook/main/useStoreFinances";
import useMainCart from "@/app/hook/main/useMainCart";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import StyledButton from "@/app/component/helpers/buttons/StyledButton";
import { useModalService } from "@/app/contexts/ModalServiceProvider";
import StoreFrontProductComponent from "@/app/component/main/mobile/shop/StoreFrontProductComponent";
import {
  StoreFrontProduct,
  StoreFrontCategory,
} from "@/app/interfaces/main/StoreFrontInterface";
import { formatDealBadge } from "@/app/_utils/main/helpers";
import {
  DEFAULT_STORE_OPENING_HOURS,
  formatOpeningHoursLabel,
} from "@/app/_utils/storeOpeningHours";

const ProductCarousel = ({
  title,
  products,
  onAddToCart,
  onViewDetails,
  addingProductId,
  isAddingToCartItem,
  textColor,
}: {
  title: string;
  products: StoreFrontProduct[];
  onAddToCart: (id: string) => void;
  onViewDetails: (productId: string) => void;
  addingProductId: string | null;
  isAddingToCartItem: (id: string) => boolean;
  textColor: string;
}) => {
  if (!products.length) return null;

  return (
    <View style={styles.section}>
      <StyledText
        variant="titleLarge"
        style={[styles.sectionTitle, { color: textColor }]}
      >
        {title}
      </StyledText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsScrollContent}
      >
        {products.map((product) => (
          <StoreFrontProductComponent
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
            isLoading={
              addingProductId === product.id || isAddingToCartItem(product.id)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
};

const StoreFrontScreen = () => {
  const { showSheetModal } = useModalService();
  const { storeId } = useLocalSearchParams();
  const { addProductToCart, isAddingToCartItem } = useMainCart();
  const { storeData, isLoading, error, triggerPhoneCall } = useStoreFront(
    typeof storeId === "string" ? storeId : undefined
  );

  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const buttonColor = useThemeColor({}, "button");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const tintColor = useThemeColor({}, "tint");
  const iconMuted = useThemeColor({}, "icons");

  const handleAddToCart = async (productId: string) => {
    setAddingProductId(productId);
    await addProductToCart(productId);
    setAddingProductId(null);
  };

  const handleViewProductDetails = useCallback((productId: string) => {
    router.push({
      pathname: "/main/mobile/(tabs)/home/ProductDescriptionScreen",
      params: { id: productId },
    });
  }, []);

  const navigateToShop = useCallback(
    (params?: { categoryId?: string; categoryName?: string }) => {
      if (!storeData?.store_id) return;
      router.push({
        pathname: "/main/mobile/(tabs)/home/StoreFrontProductScreen",
        params: {
          storeId: storeData.store_id,
          ...(params?.categoryId
            ? {
                categoryId: params.categoryId,
                categoryName: params.categoryName ?? "",
              }
            : {}),
        },
      });
    },
    [storeData?.store_id]
  );

  const handleContact = () => {
    if (!storeData) return;

    const contactInfo = storeData.contact_info;
    const contactHoursLabel = formatOpeningHoursLabel(
      storeData.opening_hours ?? DEFAULT_STORE_OPENING_HOURS
    );
    const contactModalContent = (
      <View style={styles.contactModalContent}>
        {contactInfo?.phone && (
          <View style={styles.contactInfoRow}>
            <Ionicons
              name="call-outline"
              size={20}
              color={textColor}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfoTextContainer}>
              <StyledText variant="labelSmall" style={styles.contactLabel}>
                Phone
              </StyledText>
              <Pressable
                onPress={() => triggerPhoneCall(contactInfo.phone || "")}
              >
                <StyledText
                  variant="bodyMedium"
                  style={[styles.contactValue, { color: textColor }]}
                >
                  {contactInfo.phone}
                </StyledText>
              </Pressable>
            </View>
          </View>
        )}

        {contactInfo?.address && (
          <View style={styles.contactInfoRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={textColor}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfoTextContainer}>
              <StyledText variant="labelSmall" style={styles.contactLabel}>
                Address
              </StyledText>
              <StyledText
                variant="bodyMedium"
                style={[styles.contactValue, { color: textColor }]}
              >
                {contactInfo.address}
                {contactInfo.city && `, ${contactInfo.city}`}
                {contactInfo.zip_code && ` ${contactInfo.zip_code}`}
                {contactInfo.country && `, ${contactInfo.country}`}
              </StyledText>
            </View>
          </View>
        )}

        {contactInfo && !contactInfo.address && contactInfo.city && (
          <View style={styles.contactInfoRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={textColor}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfoTextContainer}>
              <StyledText variant="labelSmall" style={styles.contactLabel}>
                Location
              </StyledText>
              <StyledText
                variant="bodyMedium"
                style={[styles.contactValue, { color: textColor }]}
              >
                {contactInfo.city}
                {contactInfo.zip_code && ` ${contactInfo.zip_code}`}
                {contactInfo.country && `, ${contactInfo.country}`}
              </StyledText>
            </View>
          </View>
        )}

        {contactHoursLabel ? (
          <View style={styles.contactInfoRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color={textColor}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfoTextContainer}>
              <StyledText variant="labelSmall" style={styles.contactLabel}>
                Opening hours
              </StyledText>
              <StyledText
                variant="bodyMedium"
                style={[styles.contactValue, { color: textColor }]}
              >
                {contactHoursLabel}
              </StyledText>
            </View>
          </View>
        ) : null}

        {storeData.business_website ? (
          <View style={styles.contactInfoRow}>
            <Ionicons
              name="globe-outline"
              size={20}
              color={textColor}
              style={styles.contactIcon}
            />
            <View style={styles.contactInfoTextContainer}>
              <StyledText variant="labelSmall" style={styles.contactLabel}>
                Website
              </StyledText>
              <Pressable
                onPress={() => {
                  const url = storeData.business_website?.startsWith("http")
                    ? storeData.business_website
                    : `https://${storeData.business_website}`;
                  Linking.openURL(url);
                }}
              >
                <StyledText
                  variant="bodyMedium"
                  style={[styles.contactValue, { color: tintColor }]}
                >
                  {storeData.business_website}
                </StyledText>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    );

    showSheetModal(contactModalContent, "Contact Us", () => {});
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.contentCard, { backgroundColor }]}>
          <ActivityIndicator size="large" color={buttonColor} />
        </View>
      </View>
    );
  }

  if (error || !storeData) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.contentCard, { backgroundColor }]}>
          <StyledText variant="bodyLarge" style={{ color: textColor }}>
            {error ? "Error loading store" : "Store not found"}
          </StyledText>
        </View>
      </View>
    );
  }

  const isOpen =
    storeData.is_operational && storeData.status === "open";
  const statusLabel = isOpen
    ? "Open"
    : storeData.status === "suspended"
      ? "Suspended"
      : "Closed";
  const statusBg = isOpen ? "#1B7A3D22" : "#8B000022";
  const statusColor = isOpen ? "#2E9B55" : "#C45C5C";

  const cityLabel =
    storeData.contact_info?.city ||
    storeData.contact_info?.country ||
    null;

  const distanceLabel = storeData.delivery?.distance_label ?? null;
  const openingHoursLabel = formatOpeningHoursLabel(
    storeData.opening_hours ?? DEFAULT_STORE_OPENING_HOURS
  );

  const renderCategoryChip = (category: StoreFrontCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryChip, { backgroundColor: cardColor, borderColor }]}
      onPress={() =>
        navigateToShop({
          categoryId: category.id,
          categoryName: category.name,
        })
      }
      activeOpacity={0.85}
    >
      {category.image ? (
        <Image source={{ uri: category.image }} style={styles.categoryImage} />
      ) : (
        <View
          style={[styles.categoryImagePlaceholder, { backgroundColor: `${tintColor}22` }]}
        >
          <StyledText variant="labelMedium" style={{ color: tintColor }}>
            {category.name.charAt(0).toUpperCase()}
          </StyledText>
        </View>
      )}
      <StyledText
        variant="labelSmall"
        numberOfLines={1}
        style={[styles.categoryName, { color: textColor }]}
      >
        {category.name}
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted }}>
        {category.product_count} items
      </StyledText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentCard, { backgroundColor }]}>
          <View style={styles.headerSection}>
            <StyledText
              variant="headlineLarge"
              style={[styles.storeName, { color: textColor }]}
            >
              {storeData.store_name}
            </StyledText>

            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColor },
                  ]}
                />
                <StyledText
                  variant="labelSmall"
                  style={[styles.statusText, { color: statusColor }]}
                >
                  {statusLabel}
                </StyledText>
              </View>

              {storeData.average_rating > 0 ? (
                <View style={styles.metaChip}>
                  <Ionicons name="star" size={14} color="#E6A700" />
                  <StyledText variant="labelSmall" style={{ color: textColor }}>
                    {storeData.average_rating.toFixed(1)}
                    {storeData.ratings_count > 0
                      ? ` (${storeData.ratings_count})`
                      : ""}
                  </StyledText>
                </View>
              ) : null}

              {storeData.total_products > 0 ? (
                <View style={styles.metaChip}>
                  <Ionicons name="cube-outline" size={14} color={iconMuted} />
                  <StyledText variant="labelSmall" style={{ color: textColor }}>
                    {storeData.total_products} items
                  </StyledText>
                </View>
              ) : null}

              {storeData.total_orders > 0 ? (
                <View style={styles.metaChip}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={14}
                    color={iconMuted}
                  />
                  <StyledText variant="labelSmall" style={{ color: textColor }}>
                    {storeData.total_orders} orders
                  </StyledText>
                </View>
              ) : null}
            </View>

            {cityLabel ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={tintColor} />
                <StyledText variant="bodySmall" style={{ color: textColor }}>
                  {cityLabel}
                  {storeData.contact_info?.country &&
                  storeData.contact_info?.city
                    ? `, ${storeData.contact_info.country}`
                    : ""}
                </StyledText>
              </View>
            ) : null}

            {distanceLabel ? (
              <View style={styles.deliveryRow}>
                <Ionicons name="navigate-outline" size={16} color={iconMuted} />
                <StyledText variant="bodySmall" style={{ color: iconMuted }}>
                  {distanceLabel} away
                </StyledText>
              </View>
            ) : null}

            {openingHoursLabel ? (
              <View style={styles.hoursRow}>
                <Ionicons name="time-outline" size={16} color={tintColor} />
                <StyledText variant="bodySmall" style={{ color: textColor }}>
                  {openingHoursLabel}
                </StyledText>
              </View>
            ) : null}

            <StyledText
              variant="bodyMedium"
              style={[styles.tagline, { color: textColor }]}
            >
              {storeData.tagline}
            </StyledText>

            <TouchableOpacity
              style={styles.shopAllButton}
              onPress={() => navigateToShop()}
            >
              <StyledText
                variant="labelMedium"
                style={[styles.shopAllText, { color: tintColor }]}
              >
                Shop all {storeData.total_products > 0 ? `(${storeData.total_products})` : ""}
              </StyledText>
              <Ionicons name="chevron-forward" size={20} color={tintColor} />
            </TouchableOpacity>
          </View>

          {storeData.categories.length > 0 ? (
            <View style={styles.section}>
              <StyledText
                variant="titleLarge"
                style={[styles.sectionTitle, { color: textColor }]}
              >
                Shop by category
              </StyledText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {storeData.categories.map(renderCategoryChip)}
              </ScrollView>
            </View>
          ) : null}

          {storeData.active_deals.length > 0 ? (
            <View style={styles.section}>
              <StyledText
                variant="titleLarge"
                style={[styles.sectionTitle, { color: textColor }]}
              >
                Deals at this store
              </StyledText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealsScroll}
              >
                {storeData.active_deals.map((deal) => {
                  const badge = formatDealBadge(deal.deal_type, {
                    discount_percentage: deal.discount_percentage,
                    discount_amount: deal.discount_amount,
                    bogo_buy_quantity: deal.bogo_buy_quantity,
                    bogo_get_quantity: deal.bogo_get_quantity,
                    bundle_price: deal.bundle_price,
                  });
                  return (
                    <TouchableOpacity
                      key={deal.deal_id}
                      style={[
                        styles.dealCard,
                        { backgroundColor: cardColor, borderColor },
                      ]}
                      onPress={() => navigateToShop()}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="pricetag"
                        size={22}
                        color={tintColor}
                        style={styles.dealIcon}
                      />
                      <StyledText
                        variant="labelMedium"
                        numberOfLines={2}
                        style={[styles.dealName, { color: textColor }]}
                      >
                        {deal.name}
                      </StyledText>
                      {badge ? (
                        <StyledText
                          variant="bodySmall"
                          style={{ color: tintColor, marginTop: 4 }}
                        >
                          {badge}
                        </StyledText>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <ProductCarousel
            title="On sale now"
            products={storeData.featured_products}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewProductDetails}
            addingProductId={addingProductId}
            isAddingToCartItem={isAddingToCartItem}
            textColor={textColor}
          />

          <ProductCarousel
            title="Popular"
            products={storeData.popular_products}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewProductDetails}
            addingProductId={addingProductId}
            isAddingToCartItem={isAddingToCartItem}
            textColor={textColor}
          />

          <ProductCarousel
            title="New arrivals"
            products={storeData.new_arrivals}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewProductDetails}
            addingProductId={addingProductId}
            isAddingToCartItem={isAddingToCartItem}
            textColor={textColor}
          />

          <View style={styles.contactSection}>
            <StyledButton
              title="Contact us"
              onPress={handleContact}
              variant="medium"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreFrontScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentCard: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 8,
  },
  storeName: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "BarlowBold",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: "600",
    fontFamily: "BarlowMedium",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    marginBottom: 12,
    lineHeight: 22,
    opacity: 0.9,
  },
  shopAllButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  shopAllText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "BarlowBold",
    marginBottom: 12,
  },
  productsScrollContent: {
    paddingRight: 8,
  },
  categoriesScroll: {
    gap: 10,
    paddingRight: 8,
  },
  categoryChip: {
    width: 100,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
  },
  categoryImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginBottom: 6,
  },
  categoryImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontWeight: "600",
    textAlign: "center",
  },
  dealsScroll: {
    gap: 10,
    paddingRight: 8,
  },
  dealCard: {
    width: 140,
    minHeight: 100,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  dealIcon: {
    marginBottom: 8,
  },
  dealName: {
    fontWeight: "600",
    fontFamily: "BarlowMedium",
  },
  contactSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  contactModalContent: {
    padding: 16,
    gap: 20,
  },
  contactInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  contactIcon: {
    marginTop: 2,
  },
  contactInfoTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "BarlowMedium",
    marginBottom: 4,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "BarlowLight",
    lineHeight: 22,
  },
});
