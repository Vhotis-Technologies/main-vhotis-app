import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import StyledText from "../../helpers/forms/StyledText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RootState } from "@/app/store/store";
import {
  setMarketVerticalSlugs,
} from "@/app/store/main/slices/onboardingSlice";
import { useFetch_market_verticalsQuery } from "@/app/store/main/api/onboardingApi";
import {
  MAX_MARKET_VERTICALS,
  type MarketVertical,
} from "@/app/interfaces/others/OnboardingInterfaces";

interface MarketVerticalPickerProps {
  capConflictSlugs?: string[];
}

const MarketVerticalPicker = ({ capConflictSlugs = [] }: MarketVerticalPickerProps) => {
  const dispatch = useDispatch();
  const { data, isLoading, isError } = useFetch_market_verticalsQuery(undefined);
  const selected =
    useSelector(
      (state: RootState) => state.onboarding.storeInformationFormData?.marketVerticalSlugs,
    ) ?? [];

  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "cards");
  const borderColor = useThemeColor({}, "borders");
  const buttonColor = useThemeColor({}, "button");
  const iconMuted = useThemeColor({}, "icons");

  const verticals = useMemo(
    () => (data as { verticals?: MarketVertical[] } | undefined)?.verticals ?? [],
    [data],
  );

  const toggle = (slug: string, available: boolean) => {
    if (!available) return;
    if (selected.includes(slug)) {
      dispatch(setMarketVerticalSlugs(selected.filter((s) => s !== slug)));
      return;
    }
    if (selected.length >= MAX_MARKET_VERTICALS) return;
    dispatch(setMarketVerticalSlugs([...selected, slug]));
  };

  if (isLoading) {
    return <StyledText variant="bodySmall" style={{ color: iconMuted }}>Loading categories…</StyledText>;
  }

  if (isError) {
    return (
      <StyledText variant="bodySmall" style={{ color: "#c0392b" }}>
        Could not load categories. Please try again.
      </StyledText>
    );
  }

  return (
    <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
      <StyledText variant="labelLarge" style={{ color: textColor, marginBottom: 4 }}>
        What do you sell?
      </StyledText>
      <StyledText variant="bodySmall" style={{ color: iconMuted, marginBottom: 12 }}>
        Optional — pick up to {MAX_MARKET_VERTICALS} categories you're most interested in.
        This helps us tailor your experience; it doesn't limit what you can sell.
      </StyledText>

      <View style={styles.grid}>
        {verticals.map((vertical) => {
          const isSelected = selected.includes(vertical.slug);
          const isFull = !vertical.is_available;
          const isConflict = capConflictSlugs.includes(vertical.slug);
          const disabled =
            isFull || (!isSelected && selected.length >= MAX_MARKET_VERTICALS);

          return (
            <Pressable
              key={vertical.slug}
              disabled={disabled}
              onPress={() => toggle(vertical.slug, vertical.is_available)}
              style={[
                styles.chip,
                {
                  borderColor: isConflict ? "#c0392b" : isSelected ? buttonColor : borderColor,
                  backgroundColor: isSelected ? buttonColor : cardColor,
                  opacity: disabled ? 0.55 : 1,
                },
              ]}
            >
              <StyledText
                variant="labelMedium"
                style={{ color: isSelected ? "#fff" : textColor }}
              >
                {vertical.name}
              </StyledText>
              {isFull ? (
                <StyledText variant="labelSmall" style={{ color: isSelected ? "#fff" : iconMuted }}>
                  Full
                </StyledText>
              ) : vertical.slots_remaining != null ? (
                <StyledText
                  variant="labelSmall"
                  style={{ color: isSelected ? "rgba(255,255,255,0.8)" : iconMuted }}
                >
                  {vertical.slots_remaining} left
                </StyledText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default MarketVerticalPicker;

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  grid: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
});
