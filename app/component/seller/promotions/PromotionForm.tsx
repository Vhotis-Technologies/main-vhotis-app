import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import StyledTextInput from "@/app/component/helpers/forms/StyledTextInput";
import DateRangePicker from "./DateRangePicker";
import FormSection from "@/app/component/seller/shared/FormSection";
import ProductCatalogSearch from "@/app/component/seller/shared/ProductCatalogSearch";
import usePromotions from "@/app/hook/seller/usePromotions";
import { ProductDealType } from "@/app/interfaces/seller/PromotionsInterface";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatStoreMoney } from "@/app/_utils/storeCurrency";

const buildDealTypes = (symbol: string) =>
  [
    {
      value: "percentage" as ProductDealType,
      label: "Percentage off",
      description: "e.g. 20% off the selling price",
      icon: "percent" as const,
      accent: "#0E7490",
    },
    {
      value: "fixed" as ProductDealType,
      label: "Fixed amount",
      description: `e.g. ${symbol}5 off each unit`,
      icon: "attach-money" as const,
      accent: "#059669",
    },
    {
      value: "bogo" as ProductDealType,
      label: "BOGO",
      description: "Buy X items, get Y free",
      icon: "card-giftcard" as const,
      accent: "#D97706",
    },
    {
      value: "bundle" as ProductDealType,
      label: "Bundle",
      description: "Multi-pack for one price",
      icon: "layers" as const,
      accent: "#7C3AED",
    },
  ] as const;

const PromotionForm = () => {
  const {
    productDraft,
    productStartDate,
    productEndDate,
    handleProductSearchTermChange,
    handleSelectProduct,
    handleRemoveProduct,
    handleProductDealTypeChange,
    handleProductDealValueChange,
    handleProductFixedAmountChange,
    handleProductBogoBuyChange,
    handleProductBogoGetChange,
    handleProductBundlePriceChange,
    handleProductBundleQuantityChange,
    handleProductUsageLimitChange,
    setProductStartDate,
    setProductEndDate,
    promotionAccess,
  } = usePromotions();

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const isDark = useThemeColor({}, "background") === "#000";
  const backgroundColor = useThemeColor({}, "background");

  const { currencySymbol, storeCountry, promotionsRequirePayment, campaignFee } =
    promotionAccess;

  const DEAL_TYPES = useMemo(
    () => buildDealTypes(currencySymbol),
    [currencySymbol]
  );

  const activeDeal = DEAL_TYPES.find((d) => d.value === productDraft.dealType)!;

  const scheduleSubtitle = promotionsRequirePayment
    ? `One-time campaign fee: ${formatStoreMoney(campaignFee, storeCountry)}`
    : "Included on your plan — no campaign fee";

  const renderDealFields = () => {
    switch (productDraft.dealType) {
      case "percentage":
        return (
          <StyledTextInput
            label="Discount percentage"
            value={productDraft.dealValue}
            onChangeText={handleProductDealValueChange}
            placeholder="e.g. 15"
            keyboardType="numeric"
            info="Enter a number without the % symbol"
          />
        );
      case "fixed":
        return (
          <StyledTextInput
            label={`Discount amount (${currencySymbol})`}
            value={productDraft.fixedAmount}
            onChangeText={handleProductFixedAmountChange}
            placeholder="e.g. 5.00"
            keyboardType="numeric"
          />
        );
      case "bogo":
        return (
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <StyledTextInput
                label="Buy quantity"
                value={productDraft.bogoBuyQuantity}
                onChangeText={handleProductBogoBuyChange}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowItem}>
              <StyledTextInput
                label="Get free"
                value={productDraft.bogoGetQuantity}
                onChangeText={handleProductBogoGetChange}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      case "bundle":
        return (
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <StyledTextInput
                label="Items in bundle"
                value={productDraft.bundleQuantity}
                onChangeText={handleProductBundleQuantityChange}
                placeholder="3"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowItem}>
              <StyledTextInput
                label={`Bundle price (${currencySymbol})`}
                value={productDraft.bundlePrice}
                onChangeText={handleProductBundlePriceChange}
                placeholder="25.00"
                keyboardType="numeric"
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FormSection
        title="Products"
        subtitle="Choose which items this deal applies to"
        icon="shopping-bag"
        iconColor="#0E7490"
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        <ProductCatalogSearch
          searchTerm={productDraft.productSearchTerm}
          onSearchTermChange={handleProductSearchTermChange}
          selectedProducts={productDraft.selectedProducts}
          onSelectProduct={handleSelectProduct}
          onRemoveProduct={handleRemoveProduct}
          textColor={textColor}
          iconColor={iconColor}
          borderColor={borderColor}
          buttonColor={buttonColor}
          surfaceColor={backgroundColor}
          selectedChipBackground={isDark ? "#134e4a" : "#CCFBF1"}
          selectedChipTextColor={isDark ? "#99f6e4" : "#0F766E"}
        />
      </FormSection>

      <FormSection
        title="Deal type"
        subtitle="How shoppers save on these products"
        icon="local-offer"
        iconColor="#0E7490"
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        <View style={styles.dealGrid}>
          {DEAL_TYPES.map((deal) => {
            const selected = productDraft.dealType === deal.value;
            return (
              <TouchableOpacity
                key={deal.value}
                onPress={() => handleProductDealTypeChange(deal.value)}
                style={[
                  styles.dealCard,
                  {
                    borderColor,
                    borderWidth: selected ? 2 : 1,
                    backgroundColor: selected
                      ? `${deal.accent}12`
                      : cardColor,
                  },
                ]}
              >
                <MaterialIcons
                  name={deal.icon}
                  size={20}
                  color={selected ? deal.accent : iconColor}
                />
                <StyledText
                  variant="labelMedium"
                  style={{
                    color: textColor,
                    fontWeight: "700",
                    marginTop: 6,
                  }}
                >
                  {deal.label}
                </StyledText>
                <StyledText
                  variant="bodySmall"
                  style={{ color: iconColor, marginTop: 2, fontSize: 11 }}
                >
                  {deal.description}
                </StyledText>
              </TouchableOpacity>
            );
          })}
        </View>
      </FormSection>

      <FormSection
        title="Deal details"
        subtitle={activeDeal.description}
        icon={activeDeal.icon}
        iconColor={activeDeal.accent}
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        {renderDealFields()}
        <StyledTextInput
          label="Usage limit (optional)"
          value={productDraft.usageLimit}
          onChangeText={handleProductUsageLimitChange}
          placeholder="Unlimited if empty"
          keyboardType="numeric"
        />
      </FormSection>

      <FormSection
        title="Active dates"
        subtitle={scheduleSubtitle}
        icon="event"
        iconColor="#0E7490"
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        <DateRangePicker
          startDate={productStartDate ?? new Date()}
          endDate={productEndDate ?? new Date()}
          onStartDateChange={(date) => setProductStartDate(date || null)}
          onEndDateChange={(date) => setProductEndDate(date || null)}
        />
      </FormSection>

      {productDraft.validation.message && !productDraft.validation.isValid ? (
        <View style={[styles.alert, { borderColor: "#FCA5A5" }]}>
          <MaterialIcons name="info-outline" size={18} color="#DC2626" />
          <StyledText variant="bodySmall" style={{ color: "#DC2626", flex: 1 }}>
            {productDraft.validation.message}
          </StyledText>
        </View>
      ) : null}
    </View>
  );
};

export default PromotionForm;

const styles = StyleSheet.create({
  container: { gap: 14 },
  dealGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dealCard: {
    width: "47%",
    borderRadius: 14,
    padding: 12,
    minHeight: 100,
  },
  row: { flexDirection: "row", gap: 12 },
  rowItem: { flex: 1 },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FEF2F2",
  },
});
