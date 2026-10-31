import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { PromotionHistoryInterface } from "@/app/interfaces/seller/PromotionsInterface";
import StyledText from "@/app/component/helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/app/_utils/main/helpers";
import {
  formatCampaignDateRange,
  getStatusTheme,
} from "@/app/utils/campaignHistory";

const DEAL_ACCENT = "#0E7490";

const MobilePromotionHistoryComponent = ({
  promotion,
}: {
  promotion: PromotionHistoryInterface;
}) => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");
  const buttonColor = useThemeColor({}, "button");

  const accent = buttonColor || DEAL_ACCENT;
  const statusTheme = getStatusTheme(promotion.status, accent);
  const dateRange = formatCampaignDateRange(
    promotion.startDate,
    promotion.endDate,
  );

  const subtitle = useMemo(() => {
    if (promotion.type === "store") return "Store-wide discount";
    return "Product discount campaign";
  }, [promotion.type]);

  const metrics = [
    {
      icon: "groups" as const,
      label: "Reach",
      value: promotion.performance.reach.toLocaleString(),
    },
    {
      icon: "shopping-bag" as const,
      label: "Engagement",
      value: promotion.performance.engagement.toLocaleString(),
    },
    {
      icon: "payments" as const,
      label: "Sales",
      value: formatCurrency(promotion.performance.sales),
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
        },
        promotion.status === "active" && {
          borderColor: `${accent}50`,
          backgroundColor: `${accent}08`,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialIcons
            name={promotion.type === "store" ? "store" : "local-offer"}
            size={22}
            color={accent}
          />
        </View>
        <View style={styles.headerCopy}>
          <StyledText
            variant="labelLarge"
            numberOfLines={2}
            style={{ color: textColor, fontWeight: "700" }}
          >
            {promotion.name}
          </StyledText>
          <StyledText variant="bodySmall" style={{ color: mutedColor, marginTop: 2 }}>
            {subtitle}
          </StyledText>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusTheme.bg,
              borderColor: statusTheme.border,
            },
          ]}
        >
          <StyledText
            variant="labelSmall"
            style={{ color: statusTheme.text, fontWeight: "700" }}
          >
            {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
          </StyledText>
        </View>
      </View>

      <View style={[styles.dateRow, { borderTopColor: borderColor }]}>
        <MaterialIcons name="date-range" size={16} color={mutedColor} />
        <StyledText
          variant="bodySmall"
          style={{ color: mutedColor, flex: 1, lineHeight: 18 }}
        >
          {dateRange}
        </StyledText>
      </View>

      <View style={styles.metricsRow}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={[styles.metricTile, { borderColor, backgroundColor: `${accent}06` }]}
          >
            <MaterialIcons name={metric.icon} size={16} color={accent} />
            <StyledText variant="labelSmall" style={{ color: mutedColor, marginTop: 4 }}>
              {metric.label}
            </StyledText>
            <StyledText
              variant="labelLarge"
              style={{ color: textColor, fontWeight: "700", marginTop: 2 }}
              numberOfLines={1}
            >
              {metric.value}
            </StyledText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 92,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    minWidth: 0,
  },
});

export default MobilePromotionHistoryComponent;
