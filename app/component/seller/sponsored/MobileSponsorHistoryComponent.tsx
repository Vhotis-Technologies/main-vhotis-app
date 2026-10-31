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

const SPONSOR_ACCENT = "#6366F1";

const MobileSponsorHistoryComponent = ({
  sponsorship,
}: {
  sponsorship: PromotionHistoryInterface;
}) => {
  const cardColor = useThemeColor({}, "cards");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borders");
  const mutedColor = useThemeColor({}, "icons");

  const statusTheme = getStatusTheme(sponsorship.status, SPONSOR_ACCENT);
  const dateRange = formatCampaignDateRange(
    sponsorship.startDate,
    sponsorship.endDate,
  );

  const subtitle = useMemo(() => {
    if (sponsorship.type === "store") {
      return "Store-wide featured placement";
    }
    return "Product featured placement";
  }, [sponsorship.type]);

  const metrics = [
    {
      icon: "visibility" as const,
      label: "Reach",
      value: sponsorship.performance.reach.toLocaleString(),
    },
    {
      icon: "touch-app" as const,
      label: "Engagement",
      value: sponsorship.performance.engagement.toLocaleString(),
    },
    {
      icon: "payments" as const,
      label: "Sales",
      value: formatCurrency(sponsorship.performance.sales),
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
        sponsorship.status === "active" && {
          borderColor: `${SPONSOR_ACCENT}50`,
          backgroundColor: `${SPONSOR_ACCENT}08`,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[styles.iconWrap, { backgroundColor: `${SPONSOR_ACCENT}18` }]}
        >
          <MaterialIcons
            name={
              sponsorship.type === "store" ? "storefront" : "star-outline"
            }
            size={22}
            color={SPONSOR_ACCENT}
          />
        </View>
        <View style={styles.headerCopy}>
          <StyledText
            variant="labelLarge"
            numberOfLines={2}
            style={{ color: textColor, fontWeight: "700" }}
          >
            {sponsorship.name}
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
            {sponsorship.status.charAt(0).toUpperCase() +
              sponsorship.status.slice(1)}
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
            style={[
              styles.metricTile,
              {
                borderColor,
                backgroundColor: `${SPONSOR_ACCENT}06`,
              },
            ]}
          >
            <MaterialIcons name={metric.icon} size={16} color={SPONSOR_ACCENT} />
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

export default MobileSponsorHistoryComponent;
