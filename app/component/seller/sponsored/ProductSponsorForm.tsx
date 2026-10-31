import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StyledText from "@/app/component/helpers/forms/StyledText";
import DateRangePicker from "@/app/component/seller/promotions/DateRangePicker";
import FormSection from "@/app/component/seller/shared/FormSection";
import ProductCatalogSearch from "@/app/component/seller/shared/ProductCatalogSearch";
import AudienceTargetingSection from "./AudienceTargetingSection";
import useSponsor from "@/app/hook/seller/useSponsor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { usePromotionRates } from "@/app/hook/seller/usePromotionRates";

const ProductSponsorForm = () => {
  const {
    productSponsorDraft,
    productStartDate,
    productEndDate,
    handleProductSearchTermChange,
    handleSelectProduct,
    handleRemoveProduct,
    setProductStartDate,
    setProductEndDate,
    handleProductAgeRangeSelection,
    handleProductInterestSelection,
    handleProductGenderSelection,
    handleProductEthnicitySelection,
  } = useSponsor();

  const { rates } = usePromotionRates();
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icons");
  const borderColor = useThemeColor({}, "borders");
  const cardColor = useThemeColor({}, "cards");
  const buttonColor = useThemeColor({}, "button");
  const backgroundColor = useThemeColor({}, "background");
  const isDark = backgroundColor === "#000";
  

  return (
    <View style={styles.container}>
      <FormSection
        title="Products to sponsor"
        subtitle="Only selected items get the sponsored badge"
        icon="inventory-2"
        iconColor="#6366F1"
        textColor={textColor}
        mutedColor={iconColor}
        borderColor={borderColor}
        surfaceColor={cardColor}
      >
        <ProductCatalogSearch
          searchTerm={productSponsorDraft.productSearchTerm}
          onSearchTermChange={handleProductSearchTermChange}
          selectedProducts={productSponsorDraft.selectedProducts}
          onSelectProduct={handleSelectProduct}
          onRemoveProduct={handleRemoveProduct}
          textColor={textColor}
          iconColor={iconColor}
          borderColor={borderColor}
          buttonColor={buttonColor}
          surfaceColor={backgroundColor}
          selectedChipBackground={backgroundColor}
          selectedChipTextColor={textColor}
          emptyHint="Add at least one product to sponsor."
        />
      </FormSection>

      <FormSection
        title="Schedule"
        subtitle={`${formatCurrency(rates.productDailyRate)} per product per day`}
        icon="event"
        iconColor="#6366F1"
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

      <AudienceTargetingSection
        targeting={productSponsorDraft.targeting}
        onAgeRange={handleProductAgeRangeSelection}
        onInterest={handleProductInterestSelection}
        onGender={handleProductGenderSelection}
        onEthnicity={handleProductEthnicitySelection}
        textColor={textColor}
        iconColor={iconColor}
        borderColor={borderColor}
        cardColor={cardColor}
        chipBackgroundColor={buttonColor}
      />

      <View
        style={[
          styles.estimate,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        <StyledText
          variant="labelLarge"
          style={{ color: textColor, fontWeight: "700" }}
        >
          Estimated cost
        </StyledText>
        <StyledText variant="headlineSmall" style={{ fontWeight: "800" }}>
          {formatCurrency(productSponsorDraft.estimatedCost)}
        </StyledText>
        <StyledText variant="bodySmall" style={{ color: iconColor }}>
          {productSponsorDraft.selectedProducts.length} product(s) ×{" "}
          {productSponsorDraft.durationDays || 0} day(s)
        </StyledText>
      </View>

      {productSponsorDraft.validation.message &&
      !productSponsorDraft.validation.isValid ? (
        <StyledText variant="bodySmall" style={styles.error}>
          {productSponsorDraft.validation.message}
        </StyledText>
      ) : null}
    </View>
  );
};

export default ProductSponsorForm;

const styles = StyleSheet.create({
  container: { gap: 14 },
  estimate: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  error: { color: "#D32F2F", paddingHorizontal: 4 },
});
