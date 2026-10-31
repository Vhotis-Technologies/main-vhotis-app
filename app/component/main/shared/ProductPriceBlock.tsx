import React from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "@/app/component/helpers/forms/StyledText";
import {
  ProductPriceDisplay,
  resolveProductPriceDisplay,
  DealPricingSource,
} from "@/app/_utils/main/dealPricing";
import { formatCurrency } from "@/app/_utils/main/helpers";

type ProductPriceBlockProps = {
  item: DealPricingSource;
  country?: string;
  priceStyle?: object;
  subtextStyle?: object;
  strikethroughStyle?: object;
  layout?: "column" | "inline";
};

export function ProductPriceBlock({
  item,
  country,
  priceStyle,
  subtextStyle,
  strikethroughStyle,
  layout = "column",
}: ProductPriceBlockProps) {
  const pricing = resolveProductPriceDisplay(item, country);

  return (
    <View style={layout === "column" ? styles.column : styles.inline}>
      {pricing.showStrikethrough ? (
        <View style={styles.column}>
          <StyledText variant="bodySmall" style={[styles.strikethrough, strikethroughStyle]}>
            {formatCurrency(pricing.strikethroughPrice ?? pricing.unitPrice, country)}
          </StyledText>
          <StyledText variant="labelLarge" style={priceStyle}>
            {formatCurrency(pricing.salePrice ?? pricing.unitPrice, country)}
          </StyledText>
        </View>
      ) : (
        <StyledText variant="labelLarge" style={priceStyle}>
          {formatCurrency(pricing.salePrice ?? pricing.unitPrice, country)}
        </StyledText>
      )}
      {pricing.dealSubtext ? (
        <StyledText variant="bodySmall" style={[styles.dealSubtext, subtextStyle]}>
          {pricing.dealSubtext}
        </StyledText>
      ) : null}
    </View>
  );
}

export { resolveProductPriceDisplay };
export type { ProductPriceDisplay, DealPricingSource };

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
  },
  inline: {
    flexDirection: "column",
  },
  strikethrough: {
    color: "#999",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  dealSubtext: {
    color: "#0E7490",
    marginTop: 2,
    fontWeight: "600",
  },
});
